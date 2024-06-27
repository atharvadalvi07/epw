import Card from "@mui/material/Card";
import ArrowButton from './ArrowButton';
import {Link} from "react-router-dom";

function Header(){
    return(
        <Card className="p-6 shadow-none rounded-lg">
      <div className="flex items-center">
        <div
          className="flex items-center gap-4"
          style={{
            alignSelf: 'stretch',
            padding: 10,
            justifyContent: 'flex-start',
          }}
        >
          <Link to="/">
            <img
              className="w-12 h-12 rounded-full"
              height={100}
              width={100}
              src="respirer.png"
              alt="Respirer logo"
            />
          </Link>
          <div
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              display: 'flex',
            }}
          >
            <div
              style={{
                paddingTop: 7,
                color: 'black',
                fontSize: 24,
                fontFamily: 'Calibri',
                fontWeight: '700',
                wordWrap: 'break-word',
              }}
            >
              EPW File Visualizer
            </div>
            <div
              style={{
                color: 'black',
                fontSize: 18,
                fontFamily: 'Calibri',
                fontWeight: '600',
                wordWrap: 'break-word',
              }}
            >
              Visualizing EPW Data for Pune
            </div>
          </div>
        </div>
      </div>
    </Card>
    );
    
}

export default Header;

/*<Card className="p-6  shadow-none rounded-lg">
    <div>
    <Link
            to={{
              pathname: "/",
            }}
          >
             <img
              className="w-12 h-12 rounded-full"
              height={100}
              width={100}
              paddingVertical={100}
              src="respirer.png"
              alt="Respirer logo"
            />
          </Link>
    </div>
    <div>
          <h4 className="text-black text-2xl {`${inter.variable} font-sans`} font-semibold">
            EPW File Visualizer
          </h4>
          <h5 className="text-black text-xl {`${inter.variable} font-sans`} font-semibold">
            Visualizing EPW Data for Pune 
          </h5>
    </div>
    </Card>*/
    