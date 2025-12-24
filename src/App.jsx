import { useState } from "react";
import "./App.css";

import {
  AppBar,
  Container,
  CssBaseline,
  Toolbar,
  Typography,
} from "@mui/material";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
// import AddInventory from "./AddInventory";
import InventoryPage from "./pages/InventoryPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
function App() {
  const [count, setCount] = useState(0);

  return (
    <Router>
      <CssBaseline /> {/* Resets browser default styles */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Innventory</Typography>
        </Toolbar>
      </AppBar>
      {/* <Container sx={{ mt: 4 }}> */}
      {/* <Routes>
          <Route path="/" element={<AddInventory />} />
        </Routes> */}
      {/* <Routes>
          <Route path="/" element={<InventoryPage />} />
        </Routes>
      </Container> */}
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<InventoryPage />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
// import {
//   AppBar,
//   Button,
//   Container,
//   CssBaseline,
//   Toolbar,
//   Typography,
// } from "@mui/material";
// import { Link, Route, BrowserRouter as Router, Routes } from "react-router-dom";
// import "./App.css";

// import DatabaseExperimentPage from "./pages/DatabaseExperimentPage";
// import InventoryPage from "./pages/InventoryPage";

// function App() {
//   return (
//     <Router>
//       <CssBaseline />

//       <AppBar position="static">
//         <Toolbar>
//           <Typography variant="h6" sx={{ flexGrow: 1 }}>
//             Hotel Inventory
//           </Typography>

//           {/* Simple navigation */}
//           <Button color="inherit" component={Link} to="/">
//             Inventory
//           </Button>
//           <Button color="inherit" component={Link} to="/database-experiment">
//             DB Experiment
//           </Button>
//         </Toolbar>
//       </AppBar>

//       <Container sx={{ mt: 4 }}>
//         <Routes>
//           <Route path="/" element={<InventoryPage />} />
//           <Route
//             path="/database-experiment"
//             element={<DatabaseExperimentPage />}
//           />
//         </Routes>
//       </Container>
//     </Router>
//   );
// }

// export default App;
