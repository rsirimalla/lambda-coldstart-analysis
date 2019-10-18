const request = require("request");
const chip_host = "https://natgeo-preprod-qa.apigee.net";
const agg_base_path = "/aggregation/v1/pages/?url=";

urls = [
  "https://www.nationalgeographic.co.uk/",
  "https://www.nationalgeographic.co.es/planeta-o-plastico/2018/05/la-carrera-por-salvar-artefactos-plasticos-historicos",
  "https://www.nationalgeographic.co.uk/subscribe",
  "https://www.nationalgeographic.co.es/404",
  "https://www.nationalgeographic.co.uk/article-video-preview",
  "https://www.nationalgeographic.co.es/espacio/2018/05/son-los-martemotos-parecidos-los-terremotos-la-nasa-pretende-averiguarlo",
  "https://www.nationalgeographic.co.es/medio-ambiente/2018/05/estos-graficos-desglosan-los-medios-de-transporte-mas-verdes",
  "https://www.nationalgeographic.co.es/video/tv/que-le-ocurrio-la-colonia-perdida-de-roanoke",
  "https://www.nationalgeographic.co.uk/animals/2018/04/how-deep-sea-fish-are-so-exceptionally-black"
];

const options = {
  method: "GET",
  json: true,
  time: true,
  headers: {
    Accept: "application/json",
    apikey: ""
    // "bypass-cache": "true"
  }
};

for (let i = 0; i < 1000; i++) {
  options.url =
    chip_host + agg_base_path + urls[Math.floor(Math.random() * urls.length)];
  let url = options.url;
  request(options, function(err, res, body) {
    if (err) {
      console.log(err);
    } else {
      {
        console.log(
          res &&
            res.statusCode +
              "," +
              Math.trunc(res.timingPhases.wait) +
              "," +
              Math.trunc(res.timingPhases.dns) +
              "," +
              Math.trunc(res.timingPhases.tcp) +
              "," +
              Math.trunc(res.timingPhases.firstByte) +
              "," +
              Math.trunc(res.timingPhases.download) +
              "," +
              Math.trunc(res.timingPhases.total) +
              "," +
              url
        );
      }
    }
  });
}
