const fetch = require('node-fetch');
const cheerio = require('cheerio');
const NodeCache = require('node-cache');
const myCache = new NodeCache();

const getMoveInfoByCode = async (body, moveCode) => {
  //returns the chess move data
  const $ = cheerio.load(body);
  let moveInfo = null;
  await $('body > font > p > table > tbody > tr').each((index, element) => {
    const code = $(element).find('td')[0].children[0].children[0].data;
    const moveName =
      $(element).find('td')[1].children[0].children[0].children[0].data;
    const moveData =
      $(element).find('td')[1].children[0].children[3].children[0].data;

    if (code === moveCode) {
      moveInfo = {
        moveData,
        code,
        moveName,
      };
      return;
    }
  });
  return moveInfo;
};

exports.urlCacheController = async (req, res, next) => {
  const chessecohelpURL = 'https://www.chessgames.com/chessecohelp.html';
  let body = null;
  const cacheResult = myCache.get(chessecohelpURL);
  if (cacheResult == undefined) {
    // handle cache missmiss!
    const response = await fetch(chessecohelpURL);
    body = await response.text();
    console.log(myCache.set(chessecohelpURL, { body }, 180));
  } else {
    // handle cache hit
    body = cacheResult.body;
  }
  req.body = body;
  next();
};

exports.rootController = async (req, res, next) => {
  return res.send(req.body);
};

exports.moveController = async (req, res, next) => {
  console.log(req.params['0']);
  let resultMove = `<h2>Sorry, Unable to take next move !!</h2>`;
  const moveInfo = await getMoveInfoByCode(req.body, req.params.id);

  // get next move by comparing req and movespedia
  const dataMoves = moveInfo.moveData.split(' ');
  const queryMoves = req.params['0'].split('/');
  dataMoves.forEach((ele, i) => {
    if (ele == queryMoves[queryMoves.length - 1]) {
      resultMove = `<p>${dataMoves[i + 1]}</p>`;
    }
  });
  return res.send(resultMove);
};

exports.codeController = async (req, res, next) => {
  const moveInfo = await getMoveInfoByCode(req.body, req.params.id);
  let responseHtml = `<h2>404 Code not found !</h2>`;
  if (moveInfo) {
    responseHtml = `<style>
    p{line-height: 1.6;} em {
      font-style: italic;
     } strong {
    font-weight: bold;
    }</style><p><strong><em>${moveInfo.moveName}</em></strong></p><p><em>${moveInfo.moveData}</em></p>`;
  }
  return res.set('Content-Type', 'text/html').send(Buffer.from(responseHtml));
};
