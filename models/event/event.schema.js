const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
    {
        quotationType:{ type: String, default: 'event' }, 
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        eventDetails: {
            eventName: String, //Name of the event
            eventDate: Date, // Date of the event
            eventType: String, // Type of event
            eventLocation: String, // Location of the event
            eventMapLocation: {
                type: { type: String, default: "Point" },
                coordinates: { type: [Number], default: [0, 0] }
            }
        },
        coordinator: {
            name: String, // Name of the main contact for the event
            email: String, // Email of the main contact for the event
            cellNumber: String // Cell number of the main contact for the event
        },
        originPoint: { // Where the Origin Point
            type: { type: String, default: "Point" }, // Default value of "Point" for GeoJSON point location
            coordinates: { type: [Number], default: [0, 0] } // Default value of [0, 0] for coordinates
        },
        distanceFromKelowna: Number, // Distance from the center of Kelowna in kilometers
        serviceCharge: Number, // Service charge per km beyond a certain distance
        deliveredPrice: { type: Number, default: 0 }, // Price for delivering the unit, default value of 0
        maxWorkers: Number, // Largest number of workers utilizing the unit
        weeklyHours: Number, // Number of hours per week workers are on site
        peakUseTimes: { type: Boolean, default: false }, // Peak times of use, if any
        peakTimeSlot: { type: String, default: null },
        maxAttendees: Number,
        alcoholServed: { type: Boolean, default: false }, // Whether alcohol will be served at the event
        useAtNight: Boolean, // Whether the unit will be used at night
        useInWinter: Boolean, // Whether the unit will be used in the winter
        vipSection: {
            payPerUse: { type: Boolean, default: false }, // Whether there will be pay per use VIP units on site
            fencedOff: { type: Boolean, default: false }, // Whether the VIP units will be fenced off
            activelyCleaned: { type: Boolean, default: false } // Whether the VIP units will be actively cleaned
        },
        numUnits: Number, // Number of units required for the construction site
        serviceFrequency: String, // How often the service is required
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
        special_requirements: String,
        restrictedAccess: Boolean, // Whether there is restricted access to the site
        restrictedAccessDescription: String,
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
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'completed', 'modified', 'cancelled'],
            default: 'pending'
        },
    },
    { timestamps: true }
);
const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
