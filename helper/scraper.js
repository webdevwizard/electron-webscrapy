const https = require('https');
const axios = require('axios');

const fetchGetData = async (url) => {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });
  console.log(url);
  return await axios
    .get(`${url}`, {
      httpsAgent,
    })
    .then((res) => res.data);
};

const fetchScrappingData = async (url, start_id, count, workerNum = '') => {
  return Promise.all(
    Array.from(Array(+count)).map(async (_, i) => {
      const page_id = i + Number(start_id);
      try {
        const result = await fetchGetData(`${url}${page_id}`);
        console.log(result);

        const {
          name,
          first_topic,
          phone_number,
          display_email,
          address_parts,
          creation_date,
          claimed,
        } = result;

        if (!claimed) {
          return {
            status: 'failed',
            msg: `[Worker ${workerNum}] | Page not claimed ${page_id}`,
          };
        }
        if (!phone_number) {
          return {
            status: 'failed',
            msg: `[Worker ${workerNum}] | No phone number for ${page_id}`,
          };
        }
        const date = Number(
          creation_date.toString().split('').splice(0, 10).join('')
        );
        const newDate = new Date(date * 1000).toLocaleString();
        const category = first_topic ? 'None' : first_topic.name;
        return {
          status: 'success',
          msg: `[Worker ${workerNum}] | Successfully scraped ${start_id}, created on ${newDate}`,
          data: {
            id: page_id,
            business_name: name,
            phone_number: phone_number.split('+1')[1] || phone_number || '',
            email: display_email || '',
            city: address_parts.part_2.split(',')[0] || '',
            state: address_parts.part_2.split(',')[1] || '',
            category: category,
            page_created: newDate,
          },
        };
      } catch (e) {
        return {
          status: 'failed',
          msg: `[Worker ${workerNum}] | Unknown Error for ${page_id}`,
        };
      }
    })
  );
};

module.exports = fetchScrappingData;
