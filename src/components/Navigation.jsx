import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, ChevronRight } from "lucide-react";
import Button from "./ui/Button";
import "../styles/Navigation.css";

const Navigation = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [activeSection, setActiveSection] = useState("hero");
	const { scrollY, scrollYProgress } = useScroll();

	// Transform scroll progress to navigation background opacity
	const navBg = useTransform(scrollY, [0, 100], [0, 0.95]);
	const navBlur = useTransform(scrollY, [0, 100], [0, 10]);

	const sections = [
		{ id: "hero", label: "Home", href: "#hero" },
		{ id: "about", label: "About", href: "#about" },
		{ id: "themes", label: "Themes", href: "#themes" },
		{ id: "team", label: "Team", href: "#team" },
		{ id: "schedule", label: "Schedule", href: "#schedule" },
		{ id: "sponsors", label: "Sponsors", href: "#sponsors" },
	];

	// Track active section based on scroll position
	useEffect(() => {
		const observerOptions = {
			threshold: 0.3,
			rootMargin: "-100px 0px -50% 0px",
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					setActiveSection(entry.target.id);
				}
			});
		}, observerOptions);

		// Observe all sections
		sections.forEach((section) => {
			const element = document.getElementById(section.id);
			if (element) {
				observer.observe(element);
			}
		});

		return () => observer.disconnect();
	}, []);

	const scrollToSection = (sectionId) => {
		const element = document.getElementById(sectionId);
		if (element) {
			element.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
		setIsMenuOpen(false);
	};

	const toggleMenu = () => {
		setIsMenuOpen(!isMenuOpen);
	};

	return (
		<>
			{/* Main Navigation */}
			<motion.nav
				className="navigation"
				style={{
					backgroundColor: `rgba(0, 0, 0, ${navBg})`,
					backdropFilter: `blur(${navBlur}px)`,
				}}
				initial={{ y: -100 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.8, ease: "easeOut" }}
			>
				<div className="nav-container">
					{/* Brand/Logo */}
					<motion.div
						className="nav-brand"
						whileHover={{ scale: 1.05 }}
						transition={{ duration: 0.2 }}
					>
						<div className="brand-logo">
							<img
								src="/images/favicon.ico"
								alt="HACK-A-SOL Logo"
								className="brand-logo-image"
							/>
							<div className="brand-accent"></div>
						</div>
					</motion.div>

					{/* Desktop Navigation Links */}
					<div className="nav-links">
						{sections.map((section, index) => (
							<motion.button
								key={section.id}
								className={`nav-link ${
									activeSection === section.id ? "nav-link--active" : ""
								}`}
								onClick={() => scrollToSection(section.id)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
							>
								{section.label}
								<div className="nav-link-indicator"></div>
							</motion.button>
						))}
					</div>

					{/* CTA Button */}
					<div className="nav-cta">
						<Button
							variant="racing"
							size="md"
							icon={<ChevronRight size={16} />}
							iconPosition="right"
						>
							Register Now
						</Button>
					</div>

					{/* Mobile Menu Button */}
					<motion.button
						className="mobile-menu-toggle"
						onClick={toggleMenu}
						whileTap={{ scale: 0.95 }}
						aria-label="Toggle menu"
					>
						<motion.div
							animate={{ rotate: isMenuOpen ? 45 : 0 }}
							transition={{ duration: 0.2 }}
						>
							{isMenuOpen ? <X size={24} /> : <Menu size={24} />}
						</motion.div>
					</motion.button>
				</div>

				{/* Progress Bar */}
				<motion.div
					className="scroll-progress"
					style={{ scaleX: scrollYProgress }}
				/>
			</motion.nav>

			{/* Mobile Menu Overlay */}
			<motion.div
				className="mobile-menu"
				initial={{ opacity: 0, x: "100%" }}
				animate={{
					opacity: isMenuOpen ? 1 : 0,
					x: isMenuOpen ? "0%" : "100%",
				}}
				transition={{ duration: 0.3, ease: "easeInOut" }}
			>
				<div className="mobile-menu-content">
					<div className="mobile-menu-header">
						<span className="mobile-menu-title">Navigation</span>
						<button
							className="mobile-menu-close"
							onClick={toggleMenu}
							aria-label="Close menu"
						>
							<X size={24} />
						</button>
					</div>

					<div className="mobile-menu-links">
						{sections.map((section, index) => (
							<motion.button
								key={section.id}
								className={`mobile-menu-link ${
									activeSection === section.id ? "mobile-menu-link--active" : ""
								}`}
								onClick={() => scrollToSection(section.id)}
								initial={{ opacity: 0, x: 50 }}
								animate={{
									opacity: isMenuOpen ? 1 : 0,
									x: isMenuOpen ? 0 : 50,
								}}
								transition={{
									duration: 0.3,
									delay: isMenuOpen ? index * 0.1 : 0,
								}}
								whileTap={{ scale: 0.95 }}
							>
								<span className="mobile-menu-link-number">
									{String(index + 1).padStart(2, "0")}
								</span>
								<span className="mobile-menu-link-text">{section.label}</span>
								<ChevronRight className="mobile-menu-link-arrow" />
							</motion.button>
						))}
					</div>

					<div className="mobile-menu-cta">
						<Button
							variant="primary"
							size="lg"
							icon={<ChevronRight size={20} />}
							iconPosition="right"
							onClick={toggleMenu}
						>
							Register Now
						</Button>
					</div>
				</div>
			</motion.div>

			{/* Section Indicators */}
			<div className="section-indicators">
				<motion.div
					className="indicators-container"
					initial={{ opacity: 0, x: 50 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.8, delay: 1 }}
				>
					{sections.map((section, index) => (
						<motion.button
							key={section.id}
							className={`section-indicator ${
								activeSection === section.id ? "section-indicator--active" : ""
							}`}
							onClick={() => scrollToSection(section.id)}
							whileHover={{ scale: 1.2 }}
							whileTap={{ scale: 0.9 }}
							title={section.label}
						>
							<div className="indicator-dot"></div>
							<div className="indicator-label">{section.label}</div>
						</motion.button>
					))}
				</motion.div>
			</div>

			{/* Backdrop for mobile menu */}
			{isMenuOpen && (
				<motion.div
					className="mobile-menu-backdrop"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={toggleMenu}
				/>
			)}
		</>
	);
};

export default Navigation;
