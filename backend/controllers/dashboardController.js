import Patient from "../models/Patient.js";
import Appointment from "../models/Appointment.js";
import Invoice from "../models/Invoice.js";
import Visit from "../models/Visit.js";

export const getDashboard = async (
  req,
  res
) => {
  try {
    const now = new Date();

    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    );

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const totalPatients =
      await Patient.countDocuments({
        isArchived: false,
      });

    const todayAppointments =
      await Appointment.countDocuments({
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      });

    const checkedInPatients =
      await Appointment.countDocuments({
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        status: "checked-in",
      });

    const completedToday =
      await Appointment.countDocuments({
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
        status: "completed",
      });

    const pendingAppointments =
      await Appointment.countDocuments({
        status: {
          $in: [
            "scheduled",
            "checked-in",
          ],
        },
      });

    const invoices =
      await Invoice.find();

    let todayRevenue = 0;
    let monthlyRevenue = 0;
    let outstandingAmount = 0;

    invoices.forEach((invoice) => {
      outstandingAmount +=
        invoice.totalAmount -
        invoice.paidAmount;

      if (
        invoice.payments &&
        invoice.payments.length > 0
      ) {
        invoice.payments.forEach(
          (payment) => {
            const paymentDate =
              new Date(
                payment.paidAt
              );

            if (
              paymentDate >=
                startOfDay &&
              paymentDate <= endOfDay
            ) {
              todayRevenue +=
                payment.amount;
            }

            if (
              paymentDate >=
              startOfMonth
            ) {
              monthlyRevenue +=
                payment.amount;
            }
          }
        );
      } else {
        // fallback for old invoices
        if (
          invoice.paidAmount > 0
        ) {
          const created =
            new Date(
              invoice.createdAt
            );

          if (
            created >= startOfDay &&
            created <= endOfDay
          ) {
            todayRevenue +=
              invoice.paidAmount;
          }

          if (
            created >= startOfMonth
          ) {
            monthlyRevenue +=
              invoice.paidAmount;
          }
        }
      }
    });

    const recentAppointments =
      await Appointment.find({
        date: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      })
        .populate(
          "patient",
          "name phone"
        )
        .populate(
          "doctor",
          "name"
        )
        .sort({
          tokenNumber: 1,
        });

    return res.status(200).json({
      totalPatients,
      todayAppointments,
      checkedInPatients,
      completedToday,
      pendingAppointments,
      todayRevenue,
      monthlyRevenue,
      outstandingAmount,
      recentAppointments,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};