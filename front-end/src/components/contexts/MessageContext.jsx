// MessageContext.jsx
import { createContext, useContext, useState } from "react";

import Message from "@/components/common/Message";

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
	const [message, setMessage] = useState("");
	const [type, setType] = useState("info");
	const [open, setOpen] = useState(false);

	const showMessage = (msg, msgType = "info") => {
		setMessage(msg);
		setType(msgType);
		setOpen(true);
	};

	return (
		<MessageContext.Provider value={{ showMessage }}>
			{children}

			<Message
				message={message}
				type={type}
				open={open}
				onOpenChange={setOpen}
			/>
		</MessageContext.Provider>
	);
};

export const useMessage = () => useContext(MessageContext);
