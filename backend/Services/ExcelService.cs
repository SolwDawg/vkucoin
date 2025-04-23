using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using backend.Models;
using ExcelDataReader;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public class ExcelService
    {
        private readonly ILogger<ExcelService> _logger;
        private readonly WalletService _walletService;
        private readonly UserManager<User> _userManager;

        public ExcelService(ILogger<ExcelService> logger, WalletService walletService, UserManager<User> userManager)
        {
            _logger = logger;
            _walletService = walletService;
            _userManager = userManager;
        }

        public async Task<List<User>> ReadUsersFromExcel(Stream fileStream)
        {
            // Đăng ký hỗ trợ mã hóa cho Excel
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);

            var users = new List<User>();
            _logger.LogInformation("Starting to read Excel file");

            try
            {
                using (var reader = ExcelReaderFactory.CreateReader(fileStream))
                {
                    var result = reader.AsDataSet(new ExcelDataSetConfiguration()
                    {
                        ConfigureDataTable = (_) => new ExcelDataTableConfiguration()
                        {
                            UseHeaderRow = true
                        }
                    });

                    var dataTable = result.Tables[0];
                    _logger.LogInformation($"Found {dataTable.Rows.Count} rows in Excel file");

                    // Log tên cột để đảm bảo đúng cấu trúc
                    var columnNames = dataTable.Columns.Cast<System.Data.DataColumn>()
                                                      .Select(column => column.ColumnName).ToList();
                    _logger.LogInformation($"Excel columns: {string.Join(", ", columnNames)}");

                    for (int i = 0; i < dataTable.Rows.Count; i++)
                    {
                        var row = dataTable.Rows[i];

                        // Bỏ qua các dòng trống
                        if (row.ItemArray.All(field => field is DBNull || string.IsNullOrWhiteSpace(field.ToString())))
                        {
                            _logger.LogInformation($"Skipping empty row {i + 1}");
                            continue;
                        }

                        try
                        {
                            string studentCode = GetStringValue(TryGetColumnValue(row, "Mã sinh viên", "MaSinhVien"));
                            string fullName = GetStringValue(TryGetColumnValue(row, "Tên sinh viên", "TenSinhVien", "HoTen", "Họ tên"));
                            string className = GetStringValue(TryGetColumnValue(row, "Lớp sinh hoạt", "LopSinhHoat", "Lớp", "Lop"));
                            DateTime dateOfBirth = GetDateValue(TryGetColumnValue(row, "Năm sinh", "NamSinh", "NgaySinh", "Ngày sinh"));

                            if (!string.IsNullOrWhiteSpace(studentCode) && !string.IsNullOrWhiteSpace(fullName))
                            {
                                // Kiểm tra xem user đã tồn tại chưa
                                var existingUser = await _userManager.Users
                                    .FirstOrDefaultAsync(u => u.StudentCode == studentCode);

                                if (existingUser == null)
                                {
                                    // Tạo mới User
                                    var user = new User
                                    {
                                        UserName = studentCode,
                                        StudentCode = studentCode,
                                        FullName = fullName,
                                        Class = className,
                                        DateOfBirth = dateOfBirth,
                                        Role = "Student",
                                        IsStudent = true
                                    };

                                    // Thêm User vào danh sách
                                    users.Add(user);
                                    _logger.LogInformation($"Added user: {user.StudentCode} - {user.FullName}");
                                }
                                else
                                {
                                    _logger.LogWarning($"User already exists: {studentCode} - {fullName}");
                                }
                            }
                            else
                            {
                                _logger.LogWarning($"Skipping row {i + 1} due to missing required data. " +
                                    $"StudentCode: '{studentCode}', FullName: '{fullName}'");
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, $"Error processing row {i + 1}");
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading Excel file");
                throw;
            }

            _logger.LogInformation($"Finished reading Excel file. Found {users.Count} valid users");
            return users;
        }

        private object TryGetColumnValue(System.Data.DataRow row, params string[] possibleColumnNames)
        {
            foreach (var columnName in possibleColumnNames)
            {
                if (row.Table.Columns.Contains(columnName))
                {
                    return row[columnName];
                }
            }
            return null;
        }

        private string GetStringValue(object value)
        {
            if (value == null || value is DBNull)
                return string.Empty;

            return value.ToString().Trim();
        }

        private DateTime GetDateValue(object value)
        {
            if (value == null || value is DBNull)
                return DateTime.MinValue;

            if (value is DateTime date)
                return date;

            if (DateTime.TryParse(value.ToString(), out date))
                return date;

            return DateTime.MinValue;
        }
    }
}
