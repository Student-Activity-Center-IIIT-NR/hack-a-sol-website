'use client'

import { Carousel_003 } from "@/components/ui/skiper-ui/skiper49";

// Using the carousel component with custom images
export default function SponsorsSection() {
  const images = [
    {
      src: "/images/Desktop_1.jpg",
      alt: "Description 1",
    },
    {
      src: "/images/Desktop_1.jpg",
      alt: "Description 2",
    },
    // ... more images
  ];

  return (
    <Carousel_003
      images={images}
      showPagination={true}
      showNavigation={true}
      loop={true}
      autoplay={true}
      spaceBetween={0}
    />
  );
};
