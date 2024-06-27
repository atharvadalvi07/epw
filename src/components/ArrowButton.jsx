import React from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import {Link} from "react-router-dom";

const ArrowButton = () => {
  return (
    <div className="flex justify-center items-center mt-10 md:mx-10">
      <button className="rounded-lg border-2 border-primary-green/10 shadow-none bg-[#FCFCFC] items-center ">
        <div className="flex gap-2 pt-3 pr-5 pb-3 pl-5 items-center">
          <Link
            to={{
              pathname: "/graphs",
            }}
          >
            <h2 className="text-base font-bold text-primary-green">
              Learn More About Pune's AQ
            </h2>
          </Link>
          <span className="text-xl font-bold text-primary-green">
            <AiOutlineArrowRight />
          </span>
        </div>
      </button>
    </div>
  );
};

export default ArrowButton;
