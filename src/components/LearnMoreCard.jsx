"use client";
import * as React from "react";
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { sendGAEvent } from "@next/third-parties/google";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function RecipeReviewCard() {
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
    sendGAEvent({ event: "buttonClicked", value: "xyz" });
  };

  return (
    <Card className="sm:m-10 shadow-none rounded-xl">
      <div className="flex justify-between " onClick={handleExpandClick}>
        <div className="flex items-center">
          {/* <IoIosInformationCircleOutline className="text-xl ml-2" /> */}
          <div className="text-xl font-semibold p-2 ml-2">
            Learn More About Air Pollutants
          </div>
        </div>
        <div className="p-2">
          <CardActions disableSpacing>
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
            >
              <ExpandMoreIcon />
            </ExpandMore>
          </CardActions>
        </div>
      </div>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <div>
          <div className="px-6 text-[#6F767E] text-base">
            Air pollution poses a grave risk to public health. Globally, nearly
            4.2 million deaths are linked to ambient or outdoor air pollution,
            mainly from heart disease, stroke, chronic obstructive pulmonary
            disease, lung cancer and acute respiratory infections. To learn more
            about air pollutants, see below.
          </div>
        </div>
      </Collapse>
    </Card>
  );
}
