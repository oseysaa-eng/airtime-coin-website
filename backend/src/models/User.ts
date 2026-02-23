// src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name?: string;
  fullName?: string;
  email: string;
  password: string;
  balance: number;           // ATC balance
  staked: number;            // currently staked ATC
  totalEarnings: number;
  totalMinutes: number;
  todayMinutes: number;
  todayEarnings: number;
  chartData: number[];
  kycStatus: 'pending' | 'approved' | 'rejected' | 'not_submitted';
  createdAt?: Date;
  updatedAt?: Date;
  totalDonations: number;
  donorBadge: string;
  profileImage: string;
  badge: string;
  referralCode: string;
  referredBy: string;
  inviteCount: number;
  earnedFromReferrals: number;
  kycIdNumber: String;
  kycIdFront: String;
  kycIdBack: String;
  kycSelfie: String;
  kycReviewedBy:  Schema.Types.ObjectId;
  kycReviewedAt: Date;
  kycRejectReason: String;
  kycSubmittedAt: Date;
  notifications: Boolean, 
  biometric: Boolean, 
  withdrawalPin: String,
  theme: 'light'|'dark'|'system';
  idNumber: String, 
  kycFiles:  Object, 
  kycReviewNote: String,
  isAdmin: Boolean,
  pushTokens: String,
  userId: Schema.Types.ObjectId, 
  minutes: Number,
  atc: Number,
  fee: Number,
  rate: Number, 
  status: String,
  ipHistory: String,
  deviceIds: String,
   earlyAdopter: Boolean,
  lastAdAt: Date,
  earlyAdopterGranted: Boolean,
  trustScore: Number,
  role: 'user'|'admin'|'user';
  pausedUntil: Date,
  select: false, 
  devices: [
  {
    fingerprint: String,
    firstSeen: Date,
    lastSeen: Date,
    trusted: Boolean,
  }
]
}


const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String },
    fullName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    staked: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalMinutes: { type: Number, default: 0 },
    todayMinutes: { type: Number, default: 0 },
    todayEarnings: { type: Number, default: 0 },
    totalDonations: {type: Number, default: 0},
    referralCode: { type: String, unique: true },
    referredBy: { type: String, default: "" },
    inviteCount: { type: Number, default: 0 },
    earnedFromReferrals: { type: Number, default: 0 },
    




    
    donorBadge: { type: String, default: "None" },
    badge: {type: String,default: "New User"},
    kycStatus: { type: String, enum: ['not_submitted','pending','verified','rejected'], default: 'not_submitted' },
    kycIdNumber: { type: String, default: '' },
    kycIdFront: { type: String, default: '' },   // R2 or local URL
    kycIdBack: { type: String, default: '' },
    kycSelfie: { type: String, default: '' },
    kycReviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    kycReviewedAt: { type: Date, default: null },
    kycRejectReason: { type: String, default: '' },
    kycSubmittedAt: { type: Date },
    profileImage: { type: String, default: "" },
    notifications: { type: Boolean, default: true },
    biometric: { type: Boolean, default: false },
    earlyAdopter: { type: Boolean, default: false },
    theme: { type: String, enum: ['light','dark','system'], default: 'system' },
    withdrawalPin: { type: String, default: '' },
    idNumber: { type: String, default: "" },
    kycFiles: { type: Object, default: {} },
    kycReviewNote: { type: String, default: '' },
    pushTokens: { type: String, default: [] },
    isAdmin: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    minutes: { type: Number, required: true },
    atc: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    rate: { type: Number, required: true },
    pausedUntil: {
  type: Date,
  default: null,
  withdrawalPin: {
  type: String,
  select: false, // never auto-return
},


    devices: [
  {
    fingerprint: String,
    firstSeen: Date,
    lastSeen: Date,
    trusted: Boolean,
  }
]
},
    
    status: { type: String, enum: ["completed", "failed"], default: "completed" },
    chartData: { type: [Number], default: [0,0,0,0,0,0,0] }, 
    earlyAdopterGranted: {type: Boolean,default: false,},
    ipHistory: { type: [String], default: [] },
    trustScore: {type: Number, default: 50,},
    deviceIds: { type: [String], default: [] },
    lastAdAt: Date,
    role: { type: String,enum: ["user", "admin"],default: "user",}

    
  },
  
  { timestamps: true }
  
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);


