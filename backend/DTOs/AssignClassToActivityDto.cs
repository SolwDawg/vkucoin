using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs
{
    public class AssignClassToActivityDto
    {
        [Required]
        public string ClassNames { get; set; } // Danh sách lớp cách nhau bằng dấu phẩy
    }
}