import mongoose from 'mongoose';

// Sub-schema for meal-wise charges
const MealChargesSchema = new mongoose.Schema(
  {
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'eveningSnacks', 'dinner'],
      required: true,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    daysConsumed: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

// Sub-schema for payment history
const PaymentHistorySchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'online', 'upi', 'card', 'bank_transfer', 'other'],
      required: true,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paymentStatus: {
      type: String,
      enum: ['success', 'pending', 'failed'],
      default: 'success',
    },
    remarks: {
      type: String,
      trim: true,
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Main Bill Schema
const BillSchema = new mongoose.Schema(
  {
    billNumber: {
      type: String,
      unique: true,
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true,
    },
    messId: {
      type: String,
      required: [true, 'Mess ID is required'],
      index: true,
    },
    month: {
      type: Number,
      required: [true, 'Month is required'],
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: 2020,
    },
    billingPeriod: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    totalDaysInMonth: {
      type: Number,
      required: true,
      min: 28,
      max: 31,
    },
    daysPresent: {
      type: Number,
      required: true,
      min: 0,
    },
    daysAbsent: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMealsConsumed: {
      type: Number,
      required: true,
      min: 0,
    },
    mealWiseCharges: [MealChargesSchema],
    baseAmount: {
      type: Number,
      // REMOVED: required: true (auto-calculated)
      default: 0,
      min: 0,
    },
    fixedCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountReason: {
      type: String,
      trim: true,
    },
    lateFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    adjustments: {
      type: Number,
      default: 0,
    },
    adjustmentReason: {
      type: String,
      trim: true,
    },
    totalAmount: {
      type: Number,
      // REMOVED: required: true (auto-calculated)
      default: 0,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    amountDue: {
      type: Number,
      // REMOVED: required: true (auto-calculated)
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid', 'overdue', 'waived'],
      default: 'unpaid',
      index: true,
    },
    paymentHistory: [PaymentHistorySchema],
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: [1000, 'Remarks cannot exceed 1000 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
BillSchema.index({ studentId: 1, month: 1, year: 1 }, { unique: true });
BillSchema.index({ messId: 1, month: 1, year: 1 });
BillSchema.index({ paymentStatus: 1, dueDate: 1 });
BillSchema.index({ billNumber: 1 });

// Pre-save middleware to calculate total amount
BillSchema.pre('save', function (next) {
  // Calculate base amount from meal-wise charges
  if (this.mealWiseCharges && this.mealWiseCharges.length > 0) {
    this.baseAmount = this.mealWiseCharges.reduce(
      (sum, meal) => sum + meal.totalAmount,
      0
    );
  }

  // Calculate total amount
  this.totalAmount =
    this.baseAmount +
    this.fixedCharges +
    this.lateFee +
    this.adjustments -
    this.discount;

  // Ensure totalAmount is not negative
  if (this.totalAmount < 0) {
    this.totalAmount = 0;
  }

  // Calculate amount due
  this.amountDue = this.totalAmount - this.amountPaid;

  // Ensure amountDue is not negative
  if (this.amountDue < 0) {
    this.amountDue = 0;
  }

  // Update payment status
  if (this.amountDue <= 0 && this.totalAmount > 0) {
    this.paymentStatus = 'paid';
    if (!this.paidDate && this.amountPaid > 0) {
      this.paidDate = new Date();
    }
  } else if (this.amountPaid > 0 && this.amountDue > 0) {
    this.paymentStatus = 'partially_paid';
  } else if (new Date() > this.dueDate && this.amountDue > 0) {
    this.paymentStatus = 'overdue';
  } else if (this.totalAmount === 0) {
    this.paymentStatus = 'waived';
  } else {
    this.paymentStatus = 'unpaid';
  }

  next();
});

// Generate unique bill number
BillSchema.statics.generateBillNumber = async function (messId, month, year) {
  const prefix = `${messId}-${year}${month.toString().padStart(2, '0')}`;
  const count = await this.countDocuments({
    billNumber: { $regex: `^${prefix}` },
  });
  return `${prefix}-${(count + 1).toString().padStart(4, '0')}`;
};

// Method to add payment
BillSchema.methods.addPayment = function (amount, paymentMethod, transactionId, receivedBy, remarks) {
  this.paymentHistory.push({
    amount,
    paymentDate: new Date(),
    paymentMethod,
    transactionId,
    paymentStatus: 'success',
    remarks,
    receivedBy,
  });

  this.amountPaid += amount;
};

// Method to apply late fee
BillSchema.methods.applyLateFee = function (feeAmount, reason) {
  this.lateFee = feeAmount;
  this.remarks = this.remarks
    ? `${this.remarks}\nLate Fee Applied: ${reason}`
    : `Late Fee Applied: ${reason}`;
};

// Method to apply discount
BillSchema.methods.applyDiscount = function (discountAmount, reason) {
  this.discount = discountAmount;
  this.discountReason = reason;
};

// Method to cancel bill
BillSchema.methods.cancelBill = function (userId, reason) {
  this.isCancelled = true;
  this.isActive = false;
  this.cancelledAt = new Date();
  this.cancelledBy = userId;
  this.cancellationReason = reason;
};

// ========================================
// Simplified: Generate bill based on days present and daily food cost
// ========================================
BillSchema.statics.generateFromAttendance = async function (
  studentId,
  messId,
  month,
  year,
  foodCostPerDay,
  fixedCharges,
  generatedBy
) {
  const Attendance = mongoose.model("Attendance");
  const User = mongoose.model("User");

  // 1️⃣ Validate student
  const student = await User.findById(studentId);
  if (!student) throw new Error("Student not found");

  // 2️⃣ Check duplicate bill
  const existingBill = await this.findOne({
    studentId,
    month,
    year,
    isCancelled: false,
  });
  if (existingBill) throw new Error("Bill already exists for this month");

  // 3️⃣ Determine billing period
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  const totalDaysInMonth = endDate.getDate();

  // 4️⃣ Fetch attendance
  const attendanceRecords = await Attendance.find({
    studentId,
    date: { $gte: startDate, $lte: endDate },
  });

  // 5️⃣ Count absent and present days
  let absentDays = 0;
  attendanceRecords.forEach((record) => {
    if (record.isOnLeave || record.totalMealsPresent === 0) absentDays++;
  });

  const daysPresent = totalDaysInMonth - absentDays;
  console.log(foodCostPerDay);

  // 6️⃣ Calculate amounts
  const baseAmount = daysPresent * foodCostPerDay;
  console.log(baseAmount);
  const totalAmount = baseAmount + (fixedCharges || 0);
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 15);

  // 7️⃣ Create bill
  const bill = await this.create({
    billNumber: await this.generateBillNumber(messId, month, year),
    studentId,
    messId,
    month,
    year,
    billingPeriod: { startDate, endDate },
    totalDaysInMonth,
    daysPresent,
    daysAbsent: absentDays,
    totalMealsConsumed: 0, // not tracked anymore
    mealWiseCharges: [], // keep empty for compatibility
    baseAmount,
    fixedCharges: fixedCharges || 0,
    discount: 0,
    lateFee: 0,
    totalAmount,
    amountPaid: 0,
    amountDue: totalAmount,
    paymentStatus: "unpaid",
    dueDate,
    generatedBy,
  });

  return bill;
};



// Static method to get unpaid bills
BillSchema.statics.getUnpaidBills = async function (messId) {
  return await this.find({
    messId,
    paymentStatus: { $in: ['unpaid', 'partially_paid', 'overdue'] },
    isActive: true,
    isCancelled: false,
  })
    .sort({ dueDate: 1 })
    .populate('studentId', 'name registrationNumber email hostelId');
};

// Static method to get overdue bills
BillSchema.statics.getOverdueBills = async function (messId) {
  const today = new Date();
  return await this.find({
    messId,
    dueDate: { $lt: today },
    paymentStatus: { $in: ['unpaid', 'partially_paid', 'overdue'] },
    isActive: true,
    isCancelled: false,
  })
    .sort({ dueDate: 1 })
    .populate('studentId', 'name registrationNumber email hostelId');
};

// Static method to get billing summary
BillSchema.statics.getBillingSummary = async function (messId, month, year) {
  const result = await this.aggregate([
    {
      $match: {
        messId,
        month,
        year,
        isActive: true,
        isCancelled: false,
      },
    },
    {
      $group: {
        _id: null,
        totalBills: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalCollected: { $sum: '$amountPaid' },
        totalDue: { $sum: '$amountDue' },
        paidBills: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] },
        },
        unpaidBills: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'unpaid'] }, 1, 0] },
        },
        overdueBills: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'overdue'] }, 1, 0] },
        },
      },
    },
  ]);

  return result.length > 0 ? result[0] : null;
};

// Static method to auto-apply late fees
BillSchema.statics.applyLateFees = async function (lateFeeAmount = 50) {
  const today = new Date();
  
  const overdueBills = await this.find({
    dueDate: { $lt: today },
    paymentStatus: { $in: ['unpaid', 'partially_paid', 'overdue'] },
    isActive: true,
    isCancelled: false,
    lateFee: 0,
  });

  for (const bill of overdueBills) {
    const daysOverdue = Math.floor((today - bill.dueDate) / (1000 * 60 * 60 * 24));
    bill.applyLateFee(lateFeeAmount, `${daysOverdue} days overdue`);
    await bill.save();
  }

  return overdueBills.length;
};

export default mongoose.model('Bill', BillSchema);
