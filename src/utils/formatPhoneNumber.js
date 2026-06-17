function formatVietnamPhone(phone) {
  if (phone.startsWith("0")) {
    return "+84" + phone.slice(1);
  }
  return phone;
}

module.exports = formatVietnamPhone;