import Device from "../models/Device";

export const trackDevice = async (req: any, res: any, next: any) => {
  try {

    const device = req.body.device;

    if (!device || !req.user) return next();

    await Device.findOneAndUpdate(
      {
        userId: req.user.id,
        model: device.model
      },
      {
        ...device,
        lastSeenAt: new Date()
      },
      { upsert: true }
    );

    next();

  } catch (err) {
    console.error("DEVICE TRACK ERROR", err);
    next();
  }
};