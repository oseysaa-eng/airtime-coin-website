import FraudEvent from "../models/FraudEvent";
import DeviceBinding from "../models/DeviceBinding";
import { emitAdminEvent } from "../sockets/socket";

export const detectMultiAccountDevice = async (deviceId:any) => {

  const bindings = await DeviceBinding.find({ deviceId });

  if (bindings.length > 3) {

    const event = await FraudEvent.create({

      type: "MULTI_ACCOUNT_DEVICE",

      severity: "high",

      deviceId,

      message: `Device used by ${bindings.length} accounts`

    });

    emitAdminEvent("fraud.event", event);

  }

};