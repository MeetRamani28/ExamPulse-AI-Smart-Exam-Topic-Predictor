const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const Blueprint = require("../models/blueprint.model");
const { uploadToCloudinary } = require("../config/cloudinary"); 

/**
 * 🛸 1. Spawn Python Child Process using Cloudinary Memory Buffer Pipeline
 * @route POST /api/blueprints/process
 * @access Protected
 */
exports.generateBlueprint = async (req, res) => {
  const io = req.app.get("io"); 
  const userId = req.user._id.toString();

  try {
    // 🛡️ GATE 1: Verify Multer Memory Storage Integrity
    if (!req.file || !req.file.buffer) {
      console.error("❌ Memory storage buffer missing inside req.file");
      return res.status(400).json({ 
        success: false, 
        message: "No study document file buffer allocated. Ensure field name is 'document'." 
      });
    }

    // 🌐 STEP 1: Stream the file buffer straight to Cloudinary
    console.log(`☁️ Cloudinary stream triggered for asset: ${req.file.originalname}`);
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    
    // આ સિક્યોર URL હવે પાયથોન સ્ક્રિપ્ટ માટે ઇનપુટ પેરામીટર બનશે
    const cloudFileUrl = cloudinaryResult.secure_url;
    console.log(`🚀 File hosted successfully on Cloudinary: ${cloudFileUrl}`);

    // STEP 2: Path Mapping for Python Environment Inside 'src/ai_service'
    const pythonScript = path.resolve(__dirname, "../ai_service/process_blueprint.py");
    const pythonExecutable = path.resolve(__dirname, "../ai_service/.venv/Scripts/python.exe");

    if (!fs.existsSync(pythonScript) || !fs.existsSync(pythonExecutable)) {
      console.error("❌ Missing internal Python environment configurations or scripts.");
      return res.status(500).json({ success: false, message: "Server AI microservice environment is unconfigured." });
    }

    // ⚡ STEP 3: Spawn thread passing the remote Cloudinary URL instead of local path string
    const pythonProcess = spawn(pythonExecutable, [pythonScript, cloudFileUrl]);

    let dataResult = "";

    pythonProcess.stdout.on("data", (data) => {
      const output = data.toString();
      dataResult += output;

      const lines = output.split("\n");
      lines.forEach((line) => {
        if (line.includes("[STATUS]")) {
          const cleanMsg = line.split("[STATUS]")[1]?.trim();
          if (cleanMsg) {
            io.to(userId).emit("blueprint-status", { message: cleanMsg });
          }
        }
      });
    });

    pythonProcess.on("close", async (code) => {
      if (code === 0) {
        try {
          const parts = dataResult.split("[FINAL_RESULT]");
          if (parts.length < 2) throw new Error("Structured final result boundary flag tokens were lost.");

          const parsedResult = JSON.parse(parts[1].trim());

          // Database Storage mapping
          const savedLog = await Blueprint.create({
            userId: req.user._id,
            fileName: req.file.originalname,
            important_topics: parsedResult.important_topics, 
          });

          io.to(userId).emit("blueprint-complete", { data: savedLog });
          console.log("✨ Neural analysis pipeline completed successfully via Cloud Storage.");

        } catch (e) {
          console.error("❌ Node JS Result Parsing Failure:", e.message);
          io.to(userId).emit("blueprint-error", { message: "AI Blueprint Output Parsing Failed." });
        }
      } else {
        console.error(`❌ Core Python Process exited hard with code: ${code}`);
        io.to(userId).emit("blueprint-error", { message: "Python Core Execution Pipeline Failed." });
      }
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`[PYTHON_STDERR]: ${data.toString()}`);
    });

    // Return instant 202 Accepted frame back to Client frontend UI
    return res.status(202).json({ 
      success: true, 
      message: "Neural RAG analysis container triggered successfully via Cloud Streams." 
    });

  } catch (err) {
    console.error("❌ Global Controller Exception Event Caught:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * 📊 2. Retrieve Analysis Log History Array for the Active Account
 */
exports.getPastAnalysis = async (req, res) => {
  try {
    const logHistory = await Blueprint.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: logHistory });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};