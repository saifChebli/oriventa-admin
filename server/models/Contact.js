import { Schema, model } from 'mongoose';
import { hash, compare } from 'bcrypt';

const contactSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true
  },
  message : {
    type: String,
    required: true
  },
  isViewed : {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
});


export default model('Contact', contactSchema);
