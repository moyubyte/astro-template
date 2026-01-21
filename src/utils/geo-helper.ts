/**
 * EdgeOne 工具函数
 * context.geo 和 context.clientIp 处理
 */

// 国家代码/名称映射表
const COUNTRY_MAP: Record<string, string> = {
    // 常见国家代码 (ISO 3166-1 alpha-2)
    'CN': '中国',
    'US': '美国',
    'GB': '英国',
    'JP': '日本',
    'KR': '韩国',
    'CA': '加拿大',
    'AU': '澳大利亚',
    'DE': '德国',
    'FR': '法国',
    'IT': '意大利',
    'SG': '新加坡',
    'MY': '马来西亚',
    'TH': '泰国',
    // 常见国家名称 (EdgeOne 可能返回全名)
    'China': '中国',
    'United States': '美国',
    'United Kingdom': '英国',
    'Japan': '日本',
    'South Korea': '韩国',
    'Canada': '加拿大',
    'Australia': '澳大利亚',
    'Germany': '德国',
    'France': '法国',
    'Italy': '意大利',
    'Singapore': '新加坡',
    'Malaysia': '马来西亚',
    'Thailand': '泰国'
};

// 中国省份拼音/英文映射表
// 此列表用于将 EdgeOne 返回的英文/拼音省份转换为中文
const PROVINCE_MAP: Record<string, string> = {
    'beijing': '北京市',
    'shanghai': '上海市',
    'tianjin': '天津市',
    'chongqing': '重庆市',
    'hebei': '河北省',
    'shanxi': '山西省',
    'liaoning': '辽宁省',
    'jilin': '吉林省',
    'heilongjiang': '黑龙江省',
    'jiangsu': '江苏省',
    'zhejiang': '浙江省',
    'anhui': '安徽省',
    'fujian': '福建省',
    'jiangxi': '江西省',
    'shandong': '山东省',
    'henan': '河南省',
    'hubei': '湖北省',
    'hunan': '湖南省',
    'guangdong': '广东省',
    'hainan': '海南省',
    'sichuan': '四川省',
    'guizhou': '贵州省',
    'yunnan': '云南省',
    'shaanxi': '陕西省',
    'gansu': '甘肃省',
    'qinghai': '青海省',
    'taiwan': '台湾省',
    'nei mongol': '内蒙古自治区', 'inner mongolia': '内蒙古自治区',
    'guangxi': '广西壮族自治区',
    'xizang': '西藏自治区', 'tibet': '西藏自治区',
    'ningxia': '宁夏回族自治区',
    'xinjiang': '新疆维吾尔自治区',
    'hong kong': '香港特别行政区',
    'macau': '澳门特别行政区'
};

/**
 * 将文本转换为中文（如果是已知的英文名称）
 */
function translateCountry(input: string | undefined): string {
    if (!input) return '';
    return COUNTRY_MAP[input] || COUNTRY_MAP[input.toUpperCase()] || input;
}

/**
 * 尝试转换省份名称
 */
function translateProvince(input: string | undefined): string {
    if (!input) return '';
    // 移除可能的 "Province", "City" 等后缀进行匹配
    const key = input.toLowerCase().replace(/\s+(province|city|region|autonomous region|sar)$/, '').trim();
    return PROVINCE_MAP[key] || input;
}

/**
 * 获取 EdgeOne 地理位置信息
 */
export function getEdgeOneLocation(context: any) {
    // 尝试从多个可能的位置获取 geo 对象
    // 1. context.locals (Astro standard for adapters)
    // 2. context.request.eo (EdgeOne specific)
    // 3. context.geo (Direct EdgeOne function context)

    let geo = context.geo;
    let clientIp = context.clientIp;

    if (!geo && context.locals) {
        // 某些适配器可能把信息放在 locals 中
        if (context.locals.geo) geo = context.locals.geo;
        if (context.locals.eo && context.locals.eo.geo) geo = context.locals.eo.geo;
    }

    if (!geo && context.request) {
        // 尝试从 request 下挂载的 eo 属性获取
        const reqAny = context.request as any;
        if (reqAny.eo && reqAny.eo.geo) geo = reqAny.eo.geo;
    }

    if (!clientIp && context.clientAddress) {
        clientIp = context.clientAddress;
    }

    if (!geo) {
        return null;
    }

    // 原始数据
    const rawCountry = geo.countryName || geo.countryCodeAlpha2 || '';
    const rawProvince = geo.regionName || '';
    const rawCity = geo.cityName || '';

    // 转换为中文
    const country = translateCountry(rawCountry);
    // 只有当国家是“中国”时，才尝试转换省份名称，国外省份通常保留英文或依赖前端翻译
    const province = (country === '中国' || rawCountry === 'CN') ? translateProvince(rawProvince) : rawProvince;
    // 城市名称转换比较复杂且量大，暂时保留原样或进行简单处理
    const city = rawCity;

    return {
        country: country,
        countryCode: geo.countryCodeAlpha2 || '',
        province: province,
        city: city,
        // 确保经纬度是数字
        latitude: geo.latitude ? parseFloat(geo.latitude) : undefined,
        longitude: geo.longitude ? parseFloat(geo.longitude) : undefined,
        clientIp: clientIp
    };
}
