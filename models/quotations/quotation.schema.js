const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema(
    {
        quotationType: {
            type: String,
            enum: ['EVENT', 'FARM_ORCHARD_WINERY', 'PERSONAL_OR_BUSINESS'],
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        coordinator: {
            name: String,
            email: String,
            cellNumber: String
        },
        maxWorkers: Number,
        weeklyHours: Number,
        placement_datetime: Date,
        placement_location: {
            type: { type: String, default: "Point" },
            coordinates: { type: [Number], default: [0, 0] }
        },
        originPoint: {
            type: { type: String, default: "Point" },
            coordinates: { type: [Number], default: [0, 0] }
        },
        distanceFromKelowna: Number,
        serviceCharge: Number,
        deliveredPrice: { type: Number, default: 0 },
        useAtNight: Boolean,
        useInWinter: Boolean,
        special_requirements: String,
        numUnits: Number,
        serviceFrequency: String,
        designatedWorkers: { type: Boolean, default: false },
        workerTypes: { type: String, default: 'male' },
        handwashing: { type: Boolean, default: true },
        handSanitizerPump: { type: Boolean, default: false },
        twiceWeeklyService: { type: Boolean, default: false },
        dateTillUse: Date,
        costDetails: {
            handWashing: { type: Number, default: 0 },
            handSanitizerPump: { type: Number, default: 0 },
            twiceWeeklyServicing: { type: Number, default: 0 },
            useAtNightCost: { type: Number, default: 0 },
            useInWinterCost: { type: Number, default: 0 },
            numberOfUnitsCost: { type: Number, default: 0 },
            deliveryPrice: { type: Number, default: 0 },
            pickUpPrice: { type: Number, default: 0 },
            workersCost: { type: Number, default: 0 },
            handWashingCost: { type: Number, default: 0 },
            handSanitizerPumpCost: { type: Number, default: 0 },
            specialRequirementsCost: { type: Number, default: 0 },
            serviceFrequencyCost: { type: Number, default: 0 },
            weeklyHoursCost: { type: Number, default: 0 },
            payPerUse: { type: Number, default: 0 },
            fencedOff: { type: Number, default: 0 },
            activelyCleaned: { type: Number, default: 0 },
            alcoholServed: { type: Number, default: 0 }
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'modified', 'cancelled'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

quotationSchema.index({ placement_location: "2dsphere" });

const Quotation = mongoose.model('Quotation', quotationSchema);

module.exports = Quotation;
