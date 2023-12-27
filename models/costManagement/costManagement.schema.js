const mongoose = require('mongoose');

const costManagement = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        quotationType: String, // Type of quotation
        quotationId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        useAtNightCost:{ type: Number, default: 0 }, // Cost for using the unit at night  
        useInWinterCost:{ type: Number, default: 0 }, // Cost for using the unit in the winter
        numberOfUnitsCost:{ type: Number, default: 0 }, // Cost for the number of units
        workersCost:{ type: Number, default: 0 }, // Cost for the number of workers
        workersTypeCost:{ type: Number, default: 0 }, // Cost for the type of workers
        handWashingCost:{ type: Number, default: 0 }, // Cost for the number of hand washing stations
        handSanitizerPumpCost:{ type: Number, default: 0 }, // Cost for the number of hand sanitizer stations
        twiceWeeklyServicingCost:{ type: Number, default: 0 }, // Cost for twice weekly servicing
        specialRequirementsCost:{ type: Number, default: 0 }, // Cost for special requirements
        deliveryCost:{ type: Number, default: 0 }, // Cost for delivery
        distanceFromKelownaCost:{ type: Number, default: 0 }, // Cost for distance from Kelowna
        maxWorkersCost:{ type: Number, default: 0 }, // Cost for the maximum number of workers

    },
    { timestamps: true }
);

const CostManagement = mongoose.model('costmanagement', costManagement);

module.exports = CostManagement;



