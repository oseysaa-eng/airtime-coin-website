import mongoose, { Document, Schema } from 'mongoose';

export interface IInvite extends Document {
  inviterId: string;
  inviteeId: string;
  invitedAt: Date;
}

const InviteSchema: Schema = new Schema({
  inviterId: { type: String, required: true },
  inviteeId: { type: String, required: true },
  invitedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IInvite>('Invite', InviteSchema);
