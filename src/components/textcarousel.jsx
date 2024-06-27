"use client";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import Card from "@mui/material/Card";
import "./carouselstyle.css";
import { FaArrowCircleLeft, FaArrowCircleRight } from "react-icons/fa";
import { BsArrowLeft, BsArrowRight } from "react-icons/bs";
import { useState } from "react";

export default function CarouselWithContent() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrevClick = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextClick = () => {
    // Assuming you have 3 cards in the carousel
    if (currentIndex < 3) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div>
      <div className="flex justify-end">
        {/* <div className="px-6 font-semibold text-lg mt-2">
          Hazardous Air Pollutants-
        </div> */}
        <div className="flex justify-between mt-2 p-2 gap-[10px] cursor-pointer">
          <div className="arrow arrow-prev" onClick={handlePrevClick}>
            <BsArrowLeft className="w-[24px] h-[24px]" />
          </div>
          <div className="arrow arrow-next" onClick={handleNextClick}>
            <BsArrowRight className="w-[24px] h-[24px]" />
          </div>
        </div>
      </div>
      <Carousel
        centerMode
        centerSlidePercentage={35}
        showArrows={false}
        className="rounded-xl"
        axis="horizontal"
        showStatus={false}
        showIndicators={false}
        selectedItem={currentIndex}
        useKeyboardArrows
        showThumbs={false}
        swipeable
        emulateTouch
      >
        <div className="ml-1">
          <Card className="px-2 mt-2 mr-3 mb-4 ml-2 shadow-none rounded-xl md:w-[470px] md:h-[200px] gradientcol text-left">
            <div className="px-3 py-4">
              <div className="flex items-center ">
                <div className=" bg-[#8E59FF] text-white w-8 h-8 rounded-full text-center">
                  <div className="flex flex-col mt-1">
                    <p className="m-0 text-xs font-semibold">PM</p>
                    <p className="m-0 text-[6px] font-semibold">2&10</p>
                  </div>
                </div>
                <div className="text-lg md:text-lg font-semibold ml-3 md:ml-3">
                  Particulate Matter 2.5 & 10
                </div>
              </div>
              <div className="pt-2 pl-9 md:pl-11 text-[#5f666e] text-base font-medium">
                Particulate Matter is a broad family of inhalable and respirable
                particles, categorized by their sizes. Sources of PM can be
                natural or man-made, like dust, fire smoke, sea-salt, soot, or
                they may come from industrial activities.
              </div>
            </div>
          </Card>
        </div>
        <div className="ml-3">
          <Card className="px-2 mt-2 ml-4 mr-3 mb-4 shadow-none rounded-xl md:w-[470px] md:h-[200px] secondcard text-left">
            <div className="px-3 py-4">
              <div className="flex items-center ">
                <div className=" bg-[#EB6211] text-white w-8 h-8 rounded-full text-center">
                  <p className="text-xs font-semibold">
                    NO<sub>2</sub>
                  </p>
                </div>
                <div className="text-lg font-semibold ml-3 md:ml-3">
                  Nitrogen Dioxide
                </div>
              </div>
              <div className="pt-2 pl-9 md:pl-11 text-[#5f666e] text-base font-medium">
                NO2 plays a role in the creation of Ozone and Particulate Matter
                and like SO2, mainly gets emitted by industrial and traffic
                sources.
              </div>
            </div>
          </Card>
        </div>
        <div className="ml-3">
          <Card className="px-2 mt-2 ml-4 mr-3 mb-4 shadow-none rounded-xl md:w-[470px] md:h-[200px] thirdcard text-left">
            <div className="px-3 py-4">
              <div className="flex items-center ">
                <div className="rounded-full bg-[#5798B4] text-xs text-center w-8 h-8 flex items-center justify-center text-white">
                  CO
                </div>
                <div className="text-lg font-semibold ml-3 md:ml-3">
                  Carbon Monoxide
                </div>
              </div>
              <div className="pt-2 pl-9 md:pl-11 text-[#5f666e]  text-base font-medium">
                Carbon monoxide is a colorless, odorless gas produced by
                incomplete combustion of fossil fuels. A major air pollutant,
                sources include vehicle exhaust, industrial processes, and
                residential heating.
              </div>
            </div>
          </Card>
        </div>
        <div className="ml-3">
          <Card className="px-2 mt-2 ml-4 mr-3 mb-4 shadow-none rounded-xl md:w-[470px] md:h-[200px] fourthcard text-left">
            <div className="px-3 py-4">
              <div className="flex items-center ">
                <div className="rounded-full bg-[#CEA941] text-xs text-center w-8 h-8 flex items-center justify-center text-white">
                  <p className="text-xs font-semibold">
                    SO<sub>2</sub>
                  </p>
                </div>
                <div className="text-lg font-semibold ml-3 md:ml-3">
                  Sulphur Dioxide
                </div>
              </div>
              <div className="pt-2 pl-9 md:pl-11 text-[#5f666e]  text-base font-medium">
                Sulfur dioxide, also a colorless gas, is predominantly emitted
                from the combustion of fossil fuels used in domestic heating,
                industries and power generation.
              </div>
            </div>
          </Card>
        </div>

        <div className="ml-3">
          <Card className="px-2 mt-2 ml-4 mr-3 mb-4 shadow-none rounded-xl md:w-[470px] md:h-[200px] fifthcard text-left">
            <div className="px-3 py-4">
              <div className="flex items-center ">
                <div className="rounded-full bg-[#5D51C3] text-xs text-center w-8 h-8 flex items-center justify-center text-white">
                  <p className="text-xs font-semibold">
                    O<sub>3</sub>
                  </p>
                </div>
                <div className="text-lg font-semibold ml-3 md:ml-3">Ozone</div>
              </div>
              <div className="pt-2 pl-9 md:pl-11 text-[#5f666e]  text-base font-medium">
                Ground-level ozone is formed from photochemical reactions with
                pollutants such volatile organic compounds, carbon monoxide and
                nitrogen oxides emitted from vehicles and industry. It can also
                be generated by portable air cleaners used in homes.
              </div>
            </div>
          </Card>
        </div>
      </Carousel>
    </div>
  );
}
