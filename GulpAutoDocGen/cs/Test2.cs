/// <summary>
/// This is class <c>Test2</c>
/// </summary>
public class Test2
{
    /// <summary type="Test0">
    /// This is a Test0 field
    /// </summary>
    /// <desc>
    /// DESCRIPTION
    /// </desc>
    /// <summary type="Test0">
    /// More to come soon
    /// </summary>
    public Test0 test0;
    /// <summary type="Test1">
    /// This is a Test1 field
    /// </summary>
    public Test1 test1;
    /// <summary type="Test10">
    /// This is a Test10 field
    /// </summary>
    public Test10 test10;
    /// <summary type="string">
    /// This is a string field
    /// </summary>
    public string val;

    /// <summary type="void">
    /// This is a method
    /// </summary>
    /// <returns>
    /// nothing that can be returned
    /// </returns>
    void method0(int a, float b, Test10 _test10) {}

    /// <summary type="Test1">
    /// This is another method
    /// </summary>
    /// <returns>
    /// a reference
    /// </returns>
    Test1 method0(Test2 _test2, Test3 _test3) {
        return default(Test1);
    }
}