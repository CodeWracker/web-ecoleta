import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import "./styles.css";
import logo from "../../assets/logo.svg";
import { Link, useHistory } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { Map, TileLayer, Marker } from "react-leaflet";
import axios from "axios";
import { LeafletMouseEvent } from "leaflet";

import api from "../../services/api";

interface Item {
  id: number;
  title: string;
  image_url: string;
}
interface UF {
  sigla: string;
}
interface Municipios {
  nome: string;
}

const CreatePoint = () => {
  const [items, setitems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [selectedUF, setSelectedUF] = useState<string>("0");
  const [municipios, setMunicipios] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("0");
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([
    0,
    0,
  ]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setInitialPosition([latitude, longitude]);
    });
  }, []);
  const history = useHistory();

  useEffect(() => {
    api.get("items").then((response) => {
      setitems(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get<UF[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((response) => {
        const siglas = response.data.map((uf) => uf.sigla);
        setUfs(siglas);
      });
  }, []);

  useEffect(() => {
    if (selectedUF === "0") {
      return;
    }

    axios
      .get<Municipios[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`
      )
      .then((response) => {
        setMunicipios(response.data.map((city) => city.nome));
      });
  }, [selectedUF]);

  function handleSelectUF(event: ChangeEvent<HTMLSelectElement>): void {
    setSelectedUF(event.target.value);
  }
  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>): void {
    setSelectedCity(event.target.value);
  }
  function handleMapClick(event: LeafletMouseEvent): void {
    setSelectedPosition([event.latlng.lat, event.latlng.lng]);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  }

  function handleSelectedItem(id: number) {
    !selectedItems.includes(id)
      ? setSelectedItems([...selectedItems, id])
      : setSelectedItems(selectedItems.filter((num) => num !== id));
  }
  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const { name, email, whatsapp } = formData;
    const uf = selectedUF;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;
    const data = {
      name,
      email,
      uf,
      city,
      latitude,
      longitude,
      items,
      whatsapp,
    };
    await api.post("points", data);
    alert("Ponto de Coleta Criado!");
    history.push("/");
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} />

        <Link to="/">
          <FiArrowLeft />
          Voltar Para Home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br />
          Ponto de coleta
        </h1>
        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da Entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={handleInputChange}
            />
          </div>
          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={handleInputChange}
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input
                type="text"
                name="whatsapp"
                id="whatsapp"
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                onChange={handleSelectUF}
                value={selectedUF}
              >
                <option value="0">Selecione Uma UF</option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                onChange={handleSelectCity}
                value={selectedCity}
              >
                <option value="0">Selecione uma Cidade</option>
                {municipios.map((city) => (
                  <option value={city} key={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de Coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectedItem(item.id)}
                className={selectedItems.includes(item.id) ? "selected" : ""}
              >
                <img src={item.image_url} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar Ponto de Coleta</button>
      </form>
    </div>
  );
};
export default CreatePoint;
