import jwtUtil from "../util/jwtUtil.js";

// Verify that each request has a valid jwt token
function authorize(request, response, next) {
  const authHeader = request.headers['authorization'];

  if (authHeader == undefined) {
    response.status(400); //bad request
    response.send("Authorization header is missing");
  } else {

    const authToken = authHeader.replace("Bearer ", "");

    try { // försök verifera **
      jwtUtil.verify(authToken); // may throw jwt error-to-be-caught
      next(); // proceed to next step in express
    } catch (err) { // **  men om det inte går...
      console.log(request.ip, err.serverMessage);

      response.status(403); //forbidden
      response.send(err.clientMessage);
    }
  }
}

function authorizeAdmin(req, res, next) {
  
  const authHeader = req.headers['authorization'];
  if (authHeader == undefined) {
    res.status(400); //bad request
    res.send("Authorization header is missing");
  } else {
    const decoded = jwtUtil.getUser(req)
    if (decoded.role == "ADMIN") {
      next()
    } else {
      res.status(403).send("You do not have the admin role");
    }
  }

  
}

export default { authorize, authorizeAdmin };
