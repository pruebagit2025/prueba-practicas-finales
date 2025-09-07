import React, { useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Clientes = () => {
  const [mostrarStore, setMostrarStore] = useState(false);
  const { store, dispatch } = useGlobalReducer();
  const API = import.meta.env.VITE_BACKEND_URL + "/api";

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "", apellido: "", email: "", contraseña_hash: "",
    direccion: "", telefono: ""
  });
  const [clienteId, setClienteId] = useState("");
  const [ticketData, setTicketData] = useState({
    titulo: "", descripcion: "", prioridad: "Media"
  });
  const [ticketIds, setTicketIds] = useState({ clienteId: "", ticketId: "" });
  const [comentario, setComentario] = useState("");

  const setLoading = (v) => dispatch({ type: "api_loading", payload: v });
  const setError = (e) => dispatch({ type: "api_error", payload: e?.message || e });

  const fetchJson = (url, options = {}) =>
    fetch(url, options)
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .catch(err => ({ ok: false, data: { message: err.message } }));

  const crearCliente = () => {
    setLoading(true);
    fetchJson(`${API}/clientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoCliente)
    }).then(({ ok, data }) => {
      if (!ok) throw new Error(data.message);
      dispatch({ type: "clientes_add", payload: data });
    }).catch(setError).finally(() => setLoading(false));
  };

  const obtenerCliente = () => {
    setLoading(true);
    fetchJson(`${API}/clientes/${clienteId}`)
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message);
        dispatch({ type: "cliente_set_detail", payload: data });
      }).catch(setError).finally(() => setLoading(false));
  };

  const actualizarCliente = () => {
    setLoading(true);
    fetchJson(`${API}/clientes/${clienteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoCliente)
    }).then(({ ok, data }) => {
      if (!ok) throw new Error(data.message);
      dispatch({ type: "cliente_set_detail", payload: data });
      dispatch({ type: "clientes_upsert", payload: data });
    }).catch(setError).finally(() => setLoading(false));
  };

  const eliminarCliente = () => {
    setLoading(true);
    fetchJson(`${API}/clientes/${clienteId}`, { method: "DELETE" })
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message);
        dispatch({ type: "clientes_remove", payload: parseInt(clienteId) });
        dispatch({ type: "cliente_clear_detail" });
      }).catch(setError).finally(() => setLoading(false));
  };

  const crearTicket = () => {
    setLoading(true);
    fetchJson(`${API}/clientes/${clienteId}/ticket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ticketData)
    }).then(({ ok, data }) => {
      if (!ok) throw new Error(data.message);
      dispatch({ type: "tickets_add", payload: data });
    }).catch(setError).finally(() => setLoading(false));
  };

  const listarTickets = () => {
    setLoading(true);
    fetchJson(`${API}/clientes/${clienteId}/tickets`)
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message);
        dispatch({ type: "tickets_set_list", payload: data });
      }).catch(setError).finally(() => setLoading(false));
  };

  const obtenerTicket = () => {
    const { clienteId: cId, ticketId: tId } = ticketIds;
    setLoading(true);
    fetchJson(`${API}/clientes/${cId}/ticket/${tId}`)
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message);
        dispatch({ type: "ticket_set_detail", payload: data });
      }).catch(setError).finally(() => setLoading(false));
  };

  const cerrarTicket = () => {
    const { clienteId: cId, ticketId: tId } = ticketIds;
    setLoading(true);
    fetchJson(`${API}/clientes/${cId}/ticket/${tId}/close`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calificacion: 5, comentario: "Excelente atención" })
    }).then(({ ok, data }) => {
      if (!ok) throw new Error(data.message);
      dispatch({ type: "ticket_set_detail", payload: data });
      dispatch({ type: "tickets_upsert", payload: data });
    }).catch(setError).finally(() => setLoading(false));
  };

  const reabrirTicket = () => {
    const { clienteId: cId, ticketId: tId } = ticketIds;
    setLoading(true);
    fetchJson(`${API}/clientes/${cId}/ticket/${tId}/reopen`, { method: "PUT" })
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message);
        dispatch({ type: "ticket_set_detail", payload: data });
        dispatch({ type: "tickets_upsert", payload: data });
      }).catch(setError).finally(() => setLoading(false));
  };

  const comentar = () => {
    setLoading(true);
    fetchJson(`${API}/clientes/${clienteId}/comentario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto: comentario })
    }).then(({ ok, data }) => {
      if (!ok) throw new Error(data.message);
      dispatch({ type: "comentarios_add", payload: data });
    }).catch(setError).finally(() => setLoading(false));
  };


//  Diff para Get global
// Listados globales
   const listarTodosLosClientes = () => {
     setLoading(true);
     fetchJson(`${API}/clientes`)
       .then(({ ok, data }) => {
         if (!ok) throw new Error(data.message);
         dispatch({ type: "clientes_set_list", payload: data });
       })
       .catch(setError)
       .finally(() => setLoading(false));
   };
 
   const listarTodosLosTickets = () => {
     setLoading(true);
     fetchJson(`${API}/tickets`)
       .then(({ ok, data }) => {
         if (!ok) throw new Error(data.message);
         dispatch({ type: "tickets_set_list", payload: data });
       })
       .catch(setError)
       .finally(() => setLoading(false));
   };
  
    return (
    <div className="container py-4">
      <h2 className="mb-3">Clientes — Consola de pruebas</h2>

      {store.api.error && (
        <div className="alert alert-danger py-2">{String(store.api.error)}</div>
      )}
      {store.api.loading && (
        <div className="alert alert-info py-2">Cargando...</div>
      )}

      <div className="row flex-column g-3">
        {/* Cliente */}
        <div className="col-12 col-lg-10 col-xl-8 mx-auto d-flex flex-column">
          <div className="card mb-3">
            <div className="card-header">Cliente</div>
            <div className="card-body">
              <div className="row g-2">
                {["nombre", "apellido", "email", "contraseña_hash", "direccion", "telefono"].map((field, i) => (
                  <div key={i} className={`col-${field === "direccion" ? "8" : "6"}`}>
                    <input className="form-control" placeholder={field}
                      value={nuevoCliente[field]}
                      onChange={e => setNuevoCliente(s => ({ ...s, [field]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-primary" onClick={crearCliente}>Crear</button>
                <input className="form-control w-auto" placeholder="ID cliente"
                  value={clienteId} onChange={e => setClienteId(e.target.value)} />
                <button className="btn btn-outline-secondary" onClick={obtenerCliente}>Obtener</button>
                <button className="btn btn-warning" onClick={actualizarCliente}>Actualizar</button>
                <button className="btn btn-danger" onClick={eliminarCliente}>Eliminar</button>
              </div>
              {store.clienteDetail && (
                <div className="alert alert-secondary mt-3">
                  <pre className="small m-0">{JSON.stringify(store.clienteDetail, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

                                  {/* Listado global de clientes */}
                  <div className="card mt-3">
                    <div className="card-header">Listar todos los clientes</div>
                    <div className="card-body">
                      <button className="btn btn-outline-primary w-100 mb-2" onClick={listarTodosLosClientes}>
                        Ver todos
                      </button>
                      <ul className="list-group mt-3">
                        {Array.isArray(store.clientes) && store.clientes.length > 0 ? (
                          store.clientes.map((c) => (
                            <li key={c.id} className="list-group-item d-flex justify-content-between">
                              <span>#{c.id} — {c.nombre} {c.apellido}</span>
                              <span className="text-muted">{c.email}</span>
                            </li>
                          ))
                        ) : (
                          <li className="list-group-item text-muted">
                            No hay clientes cargados. Pulsa “Ver todos”.
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>




          {/* Comentarios */}
          <div className="card mt-3">
            <div className="card-header">Comentarios del cliente</div>
            <div className="card-body">
              <input className="form-control" placeholder="Comentario"
                value={comentario} onChange={e => setComentario(e.target.value)} />
              <div className="d-flex gap-2 mt-2">
                <button className="btn btn-primary" onClick={comentar}>Enviar comentario</button>
              </div>
              <ul className="list-group mt-3">
                {store.comentarios.map((c, i) => (
                  <li key={i} className="list-group-item">
                    {c.texto || c.comentario || JSON.stringify(c)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="col-12 col-lg-10 col-xl-8 mx-auto d-flex flex-column">
          <div className="card mb-3">
            <div className="card-header">Tickets del cliente</div>
            <div className="card-body">
              <div className="row g-2">
                <div className="col-12">
                  <input className="form-control" placeholder="Título"
                    value={ticketData.titulo}
                    onChange={e => setTicketData(s => ({ ...s, titulo: e.target.value }))} />
                </div>
                <div className="col-12">
                  <input className="form-control" placeholder="Descripción"
                    value={ticketData.descripcion}
                    onChange={e => setTicketData(s => ({ ...s, descripcion: e.target.value }))} />
                </div>
                <div className="col-12">
                  <select className="form-select"
                    value={ticketData.prioridad}
                    onChange={e => setTicketData(s => ({ ...s, prioridad: e.target.value }))}>
                    <option>Alta</option>
                    <option>Media</option>
                    <option>Baja</option>
                  </select>
                </div>
              </div>

              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-primary" onClick={crearTicket}>Crear ticket</button>
                <button className="btn btn-outline-secondary" onClick={listarTickets}>Listar tickets</button>
              </div>

              <div className="d-flex gap-2 mt-3">
                <input className="form-control w-auto" placeholder="Cliente ID"
                  value={ticketIds.clienteId}
                  onChange={e => setTicketIds(s => ({ ...s, clienteId: e.target.value }))} />
                <input className="form-control w-auto" placeholder="Ticket ID"
                  value={ticketIds.ticketId}
                  onChange={e => setTicketIds(s => ({ ...s, ticketId: e.target.value }))} />
                <button className="btn btn-outline-info" onClick={obtenerTicket}>Ver ticket</button>
                <button className="btn btn-warning" onClick={cerrarTicket}>Cerrar ticket</button>
                <button className="btn btn-danger" onClick={reabrirTicket}>Reabrir ticket</button>
              </div>

              <ul className="list-group mt-3">
                {store.tickets.map((t) => (
                  <li key={t.id} className="list-group-item d-flex justify-content-between">
                    <span>#{t.id} — {t.titulo} — {t.estado}</span>
                    <span className="text-muted">{t.prioridad}</span>
                  </li>
                ))}
              </ul>

              {store.ticketDetail && (
                <div className="alert alert-secondary mt-3">
                  <pre className="m-0 small">{JSON.stringify(store.ticketDetail, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>

          {/* Estado global */}
           
            <div className="card mt-3">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>Estado del Store</span>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setMostrarStore(s => !s)}>
                  {mostrarStore ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {mostrarStore && (
                <div className="card-body">
                  <pre className="small m-0">{JSON.stringify(store, null, 2)}</pre>
                </div>
              )}
            </div>

        </div>
      </div>
    </div>
  );
};
