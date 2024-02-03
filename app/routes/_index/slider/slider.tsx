import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import classes from "./slider.module.css";

const Slider = () => {
  const [slide, setSlide] = useState(0);

  const preSlide = () => {
    setSlide(slide === 0 ? 4 : (pre) => pre - 1);
  };
  const nextSlide = () => {
    setSlide(slide === 4 ? 0 : (pre) => pre + 1);
  };

  const data = [
    "img/konak-park-1.jpg",
    "img/konak-park-2.jpg",
    "img/konak-park-3.jpg",
    "img/konak-park-4.jpg",
    "img/konak-park-5.jpg",
  ];
  return (
    <div className={classes.slider}>
      <h1 className={classes.public__title}>Hoşgeldiniz</h1>
      <div className={classes.slider__container}>
        <img className={classes.slider_img} src={data[slide]} alt="slider" />
      </div>
      <div className={classes.icons__container}>
        <div className={classes.icons}>
          <div className={classes.icon} onClick={preSlide}>
            <ChevronLeft />
          </div>
          <div className={classes.icon} onClick={nextSlide}>
            <ChevronRight />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Slider;
