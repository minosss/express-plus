const data = [{
  name: '顺丰速运',
  code: 'shunfeng',
  homepage: 'http://www.sf-express.com',
  phone: '95338'
},
{
  name: '宅急送',
  code: 'zhaijisong',
  homepage: 'http://www.zjs.com.cn',
  phone: '400-6789-000'
},
{
  name: '京东物流',
  code: 'jd',
  homepage: 'http://www.jdwl.com/',
  phone: '950616'
},
{
  name: '中通快递',
  code: 'zhongtong',
  homepage: 'http://www.zto.cn',
  phone: '95311'
},
{
  name: '圆通速递',
  code: 'yuantong',
  homepage: 'http://www.yto.net.cn/',
  phone: '95554'
},
{
  code: 'yunda',
  name: '韵达'
},
{
  code: 'shentong',
  name: '申通'
},
{
  code: 'tiantian',
  name: '天天'
},
{
  code: 'quanfengkuaidi',
  name: '全峰快递'
},
{
  code: 'debangwuliu',
  name: '德邦物流'
},
{
  code: 'ems',
  name: 'EMS'
},
{
  code: 'emsen',
  name: 'EMS(EN)'
},
{
  code: 'emsguoji',
  name: 'EMS国际'
},
{
  code: 'youzhengguoji',
  name: '邮政国际'
},
{
  code: 'youzhengguonei',
  name: '邮政国内'
},
{
  code: 'usp',
  name: 'USP'
},
{
  code: 'usps',
  name: 'USPS'
},
{
  code: 'dhlde',
  name: 'DHL(DE)'
},
{
  code: 'dhlen',
  name: 'DHL(EN)'
},
{
  code: 'dhl',
  name: 'DHL'
},
{
  code: 'ecmsglobal',
  name: 'ECMS'
},
{
  code: 'ecmscn',
  name: '易客满'
},
{
  code: 'wanxiangwuliu',
  name: '万象物流'
},
{
  code: 'xinbangwuliu',
  name: '新邦物流'
},
{
  code: 'rufengda',
  name: '如风达'
},
{
  code: 'baishiwuliu',
  name: '百世快运'
},
{
  code: 'youshuwuliu',
  name: '优速快递'
}];

const sortedData = data.sort(({code: aCode}, {code: bCode}) => {
  const a = aCode.toLowerCase();
  const b = bCode.toLowerCase();
  return a > b ? 1 : b > a ? -1 : 0;
});

export default sortedData;
