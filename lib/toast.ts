import toast from "react-hot-toast";

export const notifySuccess = (message: string) => {
  toast.success(message, {
    style: {
      background: "#ecfdf5",
      color: "#047857",
      border: "1px solid #a7f3d0",
      padding: "12px 16px",
      fontWeight: "bold",
    },
    iconTheme: { primary: "#10b981", secondary: "#ecfdf5" },
  });
};

export const notifyUpdate = (message: string) => {
  toast(message, {
    icon: "✏️",
    style: {
      background: "#fffbeb",
      color: "#b45309",
      border: "1px solid #fde68a",
      padding: "12px 16px",
      fontWeight: "bold",
    },
  });
};

export const notifyDelete = (message: string) => {
  toast.error(message, {
    style: {
      background: "#fef2f2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
      padding: "12px 16px",
      fontWeight: "bold",
    },
  });
};
