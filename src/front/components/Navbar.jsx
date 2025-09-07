import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<nav className="navbar navbar-light bg-light">
			<div className="container">
				<Link to="/">
					<span className="navbar-brand mb-0 h1">React Boilerplate</span>
				</Link>
				<div className="ml-auto">
						  <div className="btn-group">
								<Link to="/demo">
									<button className="btn btn-primary mx-4">Context demo</button>
								</Link>
								<Link to="/clientes">
									<button className="btn btn-outline-primary">Clientes</button>
								</Link>
                   		</div>
				</div>
			</div>
		</nav>
	);
};