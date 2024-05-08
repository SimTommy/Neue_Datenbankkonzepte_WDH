const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose); // für die leichtere Handhabung der User, Events etc. 
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['organizer', 'participant', 'admin'], default: 'participant' },
  // Zusätzliche Informationen können je nach Rolle hinzugefügt werden
  createdEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }]
}, { versionKey: false }); // Diese Option entfernt das __v-Feld aus den Dokumenten

// Passwort vor dem Speichern hashen
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});


userSchema.plugin(AutoIncrement, {inc_field: 'userId'}); // 'userId' ist das Feld, das automatisch hochgezählt wird
const User = mongoose.model('User', userSchema);

module.exports = User;
