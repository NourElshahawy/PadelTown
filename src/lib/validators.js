export function isValidEmail(email) {
  if (!email) return false;
  // لازم يكون فيه @ ونطاق حقيقي بامتداد (زي .com أو .net)، مش أي حاجة بعد @
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

export function isValidEgyptianPhone(phone) {
  if (!phone) return false;
  const digitsOnly = phone.trim().replace(/[\s-]/g, "");
  // أرقام الموبايل المصرية: 01 + (0 أو 1 أو 2 أو 5) + 8 أرقام = 11 رقم بالظبط
  const re = /^01[0125][0-9]{8}$/;
  return re.test(digitsOnly);
}
