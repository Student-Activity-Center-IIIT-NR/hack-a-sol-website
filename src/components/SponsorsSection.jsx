"use client";

import { Carousel_003 } from "@/components/ui/skiper-ui/skiper49";

// Using the carousel component with custom images
export default function SponsorsSection() {
	const images = [
		{
			src: "/images/sponsors/665ae12004a0ecb37f244a3c_Frame 512918836.svg",
			alt: "Sponsor 1",
		},
		{
			src: "/images/sponsors/edfs.png",
			alt: "Sponsor 2",
		},
		{
			src: "/images/sponsors/ejkfs.png",
			alt: "Sponsor 3",
		},
		{
			src: "/images/sponsors/github-icon-lg.png",
			alt: "GitHub",
		},
		{
			src: "/images/sponsors/sfjvsv.png",
			alt: "Sponsor 4",
		},
		{
			src: "/images/sponsors/yiwedsdafvjwfe.jpg",
			alt: "Sponsor 5",
		},
	];

	return (
		<>
		<h1 className="text-4xl font-bold text-center p-10">Sponsors</h1>
		<div className="justify-center flex items-center w-full h-full">
			<Carousel_003
				className={`flex justify-center w-full h-full items-center`}
				images={images}
				showPagination={true}
				showNavigation={true}
				loop={true}
				autoplay={true}
				spaceBetween={0}
			/>
		</div>
		</>
	);
}
