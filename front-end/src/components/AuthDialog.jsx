import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "./contexts/UserContext";
import { Mail } from "lucide-react";
export function AuthDialog({ mode, setMode, open, setOpen }) {
	const [desktop, setDesktop] = useState(window.innerWidth >= 768);

	useEffect(() => {
		const handleResize = () => setDesktop(window.innerWidth >= 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	if (desktop && open) {
		return (
			<>
				<div className="absolute inset-0 backdrop-blur-xs z-50"></div>
				<Dialog open={open} onOpenChange={setOpen} modal={false}>
					<DialogTrigger asChild>
						<Button variant="outline">Edit Profile</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[300px] text-center flex flex-col justify-center items-center">
						<DialogHeader>
							<DialogTitle className="text-3xl !font-medium">
								Bem-vindo de volta!
							</DialogTitle>
							<DialogDescription className="mt-0">
								Entre na sua conta para continuar
							</DialogDescription>
						</DialogHeader>
						<ProfileForm />
					</DialogContent>
				</Dialog>
			</>
		);
	}

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>
				<Button variant="outline">Edit Profile</Button>
			</DrawerTrigger>
			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>Edit profile</DrawerTitle>
					<DrawerDescription>
						Make changes to your profile here. Click save when you&apos;re done.
					</DrawerDescription>
				</DrawerHeader>
				<ProfileForm className="px-4" />
				<DrawerFooter className="pt-2">
					<DrawerClose asChild>
						<Button variant="outline">Cancel</Button>
					</DrawerClose>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}

function ProfileForm({ className }) {
	const { user, setUser } = useUserContext();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [message, setMessage] = useState("");
	const [redirect, setRedirect] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (email && password) {
			try {
				const { data: userDoc } = await axios.post("/users/login", {
					email,
					password,
				});

				setUser(userDoc);
				setRedirect(true);
			} catch (error) {
				setMessage(`Ops, erro ao logar.. ${error.response.data}`);
			}
		} else {
			setMessage("Erro ao fazer login. Verifique seus dados.");
		}
	};

	if (redirect) return <Navigate to="/" />;

	return (
		<form className={cn("grid items-start gap-6", className)}>
			<div className="group__input relative flex justify-center items-center">
				<Mail className="absolute left-4 text-gray-400 size-5" />
				<input
					type="email"
					className="border   px-12 py-3 rounded-2xl w-full outline-primary-300"
					placeholder="seu@email.com"
					value={email}
					onChange={(e) => {
						setEmail(e.target.value);
						if (message) setMessage("");
					}}
				/>
			</div>
			<div className="grid gap-3">
				<Label htmlFor="username">Username</Label>
				<Input id="username" defaultValue="@shadcn" />
			</div>
			<Button type="submit">Save changes</Button>
		</form>
	);
}
