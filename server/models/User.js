import { Schema, model } from 'mongoose';
import { hash, compare } from 'bcrypt';

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false // exclude from queries unless explicitly selected
  },
  role: {
    type: String,
    enum: ['customerService', 'admin' , 'manager' , 'candidateService' , 'resumeService'],
    default: 'manager'
  }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hash(this.password, 12);
  next();
});

// Compare input password to hashed one
userSchema.methods.matchPassword = function (candidatePassword) {
  return compare(candidatePassword, this.password);
};

export default model('User', userSchema);
