
using System;

namespace PartParameterConsoleApp
{
    class Program
    {
        static void Main(string[] args)
        {
            _ = new TypeService();
            Console.WriteLine("Type service successfully completed.  Press any key to close.");
            Console.ReadKey();
        }
    }

}
