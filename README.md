# BaseAuth
## For basic JWT authentication services on the client


### BaseAuth
  Simple authentication services for login/logout <br />
 
  company.services.auth or easy access with BaseAuth <br />
  Requirements:  Jquery
 
* To authenticate on login <br />
```
  		window.company.services.BaseAuth.login() 
```

* To authenticate on logout <br />
```  	
    	window.company.services.BaseAuth.logout() 
```

* To authenticate only <br />
```
  		window.company.services.BaseAuth.isAuthenticated()
``` 

* To getToken  <br />
```
  		var token = window.company.services.BaseAuth.getToken()
```

##### Note: can change 'company' to your domain name
 



## TESTS: or global access from window, and namespace access
```
var oneAuth = new window.company.services.BaseAuth({
     serverUrl: "http://localhost:8081"
   });

console.log(oneAuth.isAuthenticated());
console.log(oneAuth.getToken());
```

* mock login
```
console.log(oneAuth.login({username: "longh",password: "password"}));
console.log(oneAuth.isAuthenticated());
console.log(oneAuth.getToken());
console.log(oneAuth.getServerUrl());
```

* mock logout
```
console.log(oneAuth.logout());
console.log(oneAuth.isAuthenticated());
console.log(oneAuth.getToken());
```
