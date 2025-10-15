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

    // If files are uploaded for cv/lm, set their paths
    if (req.files) {
      if (req.files.cvFile && req.files.cvFile[0]) {
        update.cvFile = `/uploads/suivi/${req.files.cvFile[0].filename}`;
        console.log('CV file path:', update.cvFile);
      }
      if (req.files.lmFile && req.files.lmFile[0]) {
        update.lmFile = `/uploads/suivi/${req.files.lmFile[0].filename}`;
        console.log('LM file path:', update.lmFile);
      }
    }

    const result = await ClientSuivi.findOneAndUpdate(
      { user: userId },
      { $set: update },
      { new: true, upsert: true }
    );
    
    console.log('Suivi updated successfully:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error updating suivi:', error);
    res.status(500).json({ message: 'Error updating suivi', error: error.message });
  }
};
