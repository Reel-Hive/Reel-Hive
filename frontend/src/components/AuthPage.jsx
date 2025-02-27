// import React, { useState, useEffect } from "react";
// import Login from "./Login";
// import Signup from "./Signup";

// const AuthPage = () => {
//   const [isLogin, setIsLogin] = useState(true);

//   useEffect(() => {
//     document.body.classList.add("login-signup-page");
//     return () => {
//       document.body.classList.remove("login-signup-page");
//     };
//   }, []);

//   return (
//     <div>
//       {isLogin ? (
//         <Login switchToSignup={() => setIsLogin(false)} />
//       ) : (
//         <Signup switchToLogin={() => setIsLogin(true)} />
//       )}
//     </div>
//   );
// };

// export default AuthPage;

import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

const AuthPage = () => {
  const [showLogin, setShowLogin] = useState(true);

  return showLogin ? (
    <Login switchToSignup={() => setShowLogin(false)} />
  ) : (
    <Signup switchToLogin={() => setShowLogin(true)} />
  );
};

export default AuthPage;

