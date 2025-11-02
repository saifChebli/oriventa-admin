import ClientSuivi from '../../models/ClientSuivi.js';

export const getSuiviForClient = async (req, res) => {
  try {
    const userId = req.user.id;
    const suivi = await ClientSuivi.findOne({ user: userId }) || await ClientSuivi.create({ user: userId });
    res.status(200).json(suivi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving suivi' });
  }
};

export const getSuiviForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const suivi = await ClientSuivi.findOne({ user: userId });
    if (!suivi) return res.status(404).json({ message: 'Suivi not found' });
    res.status(200).json(suivi);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving suivi' });
  }
};

export const upsertSuivi = async (req, res) => {
  try {
    const { userId } = req.params;
    const update = req.body;

    console.log('Updating suivi for user:', userId);
    console.log('Request body:', update);
    console.log('Files received:', req.files);

    // If files are uploaded for cv/lm, set their paths (support multiple)
    if (req.files) {
      // Initialize arrays in case we need to push
      if (!update.$push) update.$push = {};

      if (req.files.cvFile && req.files.cvFile.length > 0) {
        const cvPaths = req.files.cvFile.map(f => `/uploads/suivi/${f.filename}`);
        // Backward-compat: also set last uploaded as cvFile
        update.cvFile = cvPaths[cvPaths.length - 1];
        // Append to array
        update.$push.cvFiles = { $each: cvPaths };
        console.log('CV files paths:', cvPaths);
      }
      if (req.files.lmFile && req.files.lmFile.length > 0) {
        const lmPaths = req.files.lmFile.map(f => `/uploads/suivi/${f.filename}`);
        // Backward-compat: also set last uploaded as lmFile
        update.lmFile = lmPaths[lmPaths.length - 1];
        // Append to array
        update.$push.lmFiles = { $each: lmPaths };
        console.log('LM files paths:', lmPaths);
      }
    }

    // Build update doc: $set normal fields, $push arrays if present
    const updateDoc = {};
    const setDoc = { ...update };
    // Remove $push from $set
    if (setDoc.$push) delete setDoc.$push;
    if (Object.keys(setDoc).length) updateDoc.$set = setDoc;
    if (update.$push && Object.keys(update.$push).length) updateDoc.$push = update.$push;

    const result = await ClientSuivi.findOneAndUpdate(
      { user: userId },
      updateDoc,
      { new: true, upsert: true }
    );
    
    console.log('Suivi updated successfully:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating suivi:', error);
    res.status(500).json({ message: 'Error updating suivi', error: error.message });
  }
};
