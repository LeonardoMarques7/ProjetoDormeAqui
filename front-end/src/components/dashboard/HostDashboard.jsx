import HostCenter from "./HostCenter";

function HostDashboard({ initialView = "today", activeSection }) {
	return <HostCenter initialView={initialView} activeSection={activeSection} />;
}

export default HostDashboard;
