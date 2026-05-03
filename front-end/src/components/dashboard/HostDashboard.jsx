import HostCenter from "./HostCenter";

function HostDashboard({ initialView = "overview", activeSection }) {
	return <HostCenter initialView={initialView} activeSection={activeSection} />;
}

export default HostDashboard;
