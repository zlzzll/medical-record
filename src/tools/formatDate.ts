export default function (timestamp: number): string{
    // 创建 Date 对象
    const date = new Date(timestamp);

    // 获取年月日
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() 返回 0-11，需要加 1
    const day = date.getDate();

    // 获取小时和分钟
    const hours = date.getHours();
    const minutes = date.getMinutes();

    // 判断是 AM 还是 PM
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // 将小时转换为 12 小时制
    const hours12 = hours % 12 || 12; // 如果是 0 点，显示为 12 AM

    // 格式化分钟，确保是两位数
    const formattedMinutes = minutes.toString().padStart(2, '0');

    // 返回格式化的字符串
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hours12}:${formattedMinutes} ${ampm}`;
};