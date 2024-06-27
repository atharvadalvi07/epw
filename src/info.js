import Card from "@mui/material/Card";
import {Link} from "react-router-dom";

function Header(){
    return(
        <Card className="pt-6 pb-6 shadow-none rounded-none">
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
              height={48}
              width={48}
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
              Indoor Air Quality Dashboard
            </div>
            
          </div>
        </div>
      </div>
    </Card>
    );
    
}

export default Header;
