const { Schema, model } = require("mongoose");

/**
 *  NOTE:
 *  email is unique
 *  birthDay is timestamp in miliseconds. Ex: 895004164000
 *  ICN: Identify card (Chứng minh nhân dân)
 *  role: have 2 role ["admin"] and ["client"] default is client
 *  memberShip is Object
 *     memberType:
 *      - 0: default normal member
 *      - 1: member of combo 6
 *      - 2: member of combo 10
 *      - 3: member VIP
 *     expired:
 *      - default is 0: Don't have expired
 *      - Number: timestamp in miliseconds * (24 * 60 * 60 * days)
 * power is Point of user
 * mountainRegister is Object to check user register mountain
 * mountainStudied is Object to check user studied mountain
 */

const UserSchema = new Schema(
  {
    name: {
      type: String,
    },
    gender: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
    },
    avatar: {
      type: String,
      default: "",
    },
    birthDay: {
      type: Number,
    },
    password: {
      type: String,
    },
    ICN: {
      type: String,
    },
    address: {
      type: String,
    },
    role: {
      type: String,
      default: "client",
    },
    power: {
      type: Number,
      default: 0,
    },
    mountainRegister: {
      fansipan: {
        type: Boolean,
        default: false,
      },
      kinabalu: {
        type: Boolean,
        default: false,
      },
      kilimanjaro: {
        type: Boolean,
        default: false,
      },
      aconcaqua: {
        type: Boolean,
        default: false,
      },
    },
    mountainStudied: {
      fansipan: {
        type: Number,
        default: 1,
      },
      kinabalu: {
        type: Number,
        default: 1,
      },
      kilimanjaro: {
        type: Number,
        default: 1,
      },
      aconcaqua: {
        type: Number,
        default: 1,
      },
    },
    mountainOther: {
      fansipanMarketing: {
        type: Boolean,
        default: false,
      },
      kinabaluMarketing: {
        type: Boolean,
        default: false,
      },
      kilimanjaroMarketing: {
        type: Boolean,
        default: false,
      },
      aconcaquaMarketing: {
        type: Boolean,
        default: false,
      },
      fansipanStation: {
        type: Number,
        default: 0,
      },
      kinabaluStation: {
        type: Number,
        default: 0,
      },
      kilimanjaroStation: {
        type: Number,
        default: 0,
      },
      aconcaquaStation: {
        type: Number,
        default: 0,
      },
    },
    memberShip: {
      memberType: {
        type: Number,
        default: 0,
      },
      expired: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: Date,
  }
);

UserSchema.statics = {
  findByEmail(email) {
    return this.findOne({ email: email }).exec();
  },

  createNew(user) {
    return this.create(user);
  },

  findTopUsersByPower() {
    return this.find({}, { name: 1, power: 1, phone: 1 }).sort({ power: -1 }).limit(10).exec();
  },
};

const User = model("User", UserSchema);

module.exports = {
  User,
  UserSchema,
};
