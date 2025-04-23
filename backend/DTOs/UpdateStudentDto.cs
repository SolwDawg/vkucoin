using System.ComponentModel.DataAnnotations;

public class UpdateStudentDto
{
    private const string DefaultStringValue = "string";
    
    private string _fullName;
    private string _class;
    private string _newEmail;

    [StringLength(100)]
    public string FullName 
    { 
        get => _fullName;
        set => _fullName = (value != DefaultStringValue) ? value : null;
    }

    [StringLength(50)]
    public string Class 
    { 
        get => _class;
        set => _class = (value != DefaultStringValue) ? value : null;
    }

    [DataType(DataType.Date)]
    public DateTime? DateOfBirth { get; set; }

    [EmailAddress]
    public string NewEmail 
    { 
        get => _newEmail;
        set => _newEmail = (value != DefaultStringValue) ? value : null;
    }
}