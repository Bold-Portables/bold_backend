const mongoose = require('mongoose');

const constructionSchema = new mongoose.Schema(
    {
        quotationType:{ type: String, default: 'construction' }, 
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        coordinator: {
            name: String, // Name of the main contact for the event
            email: String, // Email of the main contact for the event
            cellNumber: String // Cell number of the main contact for the event
        },
        maxWorkers: Number, // Largest number of workers utilizing the unit
        weeklyHours: Number, // Number of hours per week workers are on site
        placementDate: Date, // Date and time the unit will be placed
        restrictedAccess: Boolean, // Whether there is restricted access to the site
        restrictedAccessDescription: String,
        placementLocation: { // Where the unit will be placed
            type: { type: String, default: 'Point' }, // Default value of 'Point' for GeoJSON point location
            coordinates: { type: [Number], default: [0, 0] } // Default value of [0, 0] for coordinates
        },
        originPoint: { // Where the Origin Point
            type: { type: String, default: 'Point' }, // Default value of 'Point' for GeoJSON point location
            coordinates: { type: [Number], default: [0, 0] } // Default value of [0, 0] for coordinates
        },
        distanceFromKelowna: Number, // Distance from the center of Kelowna in kilometers
        serviceCharge: Number, // Service charge per km beyond a certain distance
        deliveredPrice: { type: Number, default: 0 }, // Price for delivering the unit, default value of 0
        useAtNight: Boolean, // Whether the unit will be used at night
        useInWinter: Boolean, // Whether the unit will be used in the winter
        specialRequirements: String, // Any other special requirements
        numUnits: Number, // Number of units required for the job
        serviceFrequency: String, // How often the service is required
        special_requirements: String,
        designatedWorkers: { type: Boolean, default: false },
        workerTypes: { type: String, default: 'male' },
        femaleWorkers:{ type: Number, default: 0},
        maleWorkers:{ type: Number, default: 0},
        totalWorkers:{ type: Number, default: 0},
        handwashing: { type: Boolean, default: true },
        handSanitizerPump: { type: Boolean, default: false },
        twiceWeeklyService: { type: Boolean, default: false },
        productTypes: { type: String, default: null },
        dateTillUse: Date,
        status: {
            type: String,
            enum: ['pending', 'active', 'completed', 'modified', 'cancelled'],
            default: 'pending'
        },
        costDetails: { // Cost details for various components
            handWashing: {
                type: Number,
                default: 0
            },
            handSanitizerPump: {
                type: Number,
                default: 0
            },
            twiceWeeklyServicing: {
                type: Number,
                default: 0
            },
            useAtNightCost: {
                type: Number,
                default: 0
            },
            useInWinterCost: {
                type: Number,
                default: 0
            },
            numberOfUnitsCost: {
                type: Number,
                default: 0
            },
            deliveryPrice: {
                type: Number,
                default: 0
            },
            pickUpPrice: {
                type: Number,
                default: 0
            },
            workersCost: {
                type: Number,
                default: 0
            },
            handWashingCost: {
                type: Number,
                default: 0
            },
            handSanitizerPumpCost: {
                type: Number,
                default: 0
            },
            specialRequirementsCost: {
                type: Number,
                default: 0
            },
            serviceFrequencyCost: {
                type: Number,
                default: 0
            },
            weeklyHoursCost: {
                type: Number,
                default: 0
            },
            payPerUse: {
                type: Number,
                default: 0
            },
            fencedOff: {
                type: Number,
                default: 0
            },
            activelyCleaned: {
                type: Number,
                default: 0
            },
            alcoholServed:{
                type: Number,
                default: 0
            }
        }
        

    },
    { timestamps: true }
);

const Construction = mongoose.model('Construction', constructionSchema);

module.exports = Construction;
