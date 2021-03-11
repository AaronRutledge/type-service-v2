// Sample code

//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace PartParameterConsoleApp
//{
//    class SqlConnect
//    {

//        var partCatalog = new List<PartCatalogItem>();
//        var partsParameterDictionary = new Dictionary<string, List<PartParameterItem>>();
//        string connStr = "server=stairparts.cvewfrcgrpzi.us-west-2.rds.amazonaws.com;user=Administrator;database=stairparts;port=3306;password=st0nefly";
//        MySqlConnection conn = new MySqlConnection(connStr);

//            try
//            {
//                Console.WriteLine("Connecting to MySQL...");
//                conn.Open();
//                // Perform database operations
//                string sql = "SELECT * FROM partcatalog";
//        MySqlCommand cmd = new MySqlCommand(sql, conn);
//        MySqlDataReader rdr = cmd.ExecuteReader();
                
//                while (rdr.Read())
//                {
//                    var item = new PartCatalogItem()
//                    {
//                        partTypeId = (int)rdr["partTypeId"],
//                        isAssembly = (bool)rdr["isAssembly"],
//                        parentPartId = (int)rdr["parentPartId"],
//                        partFilePath = rdr["partFilePath"].ToString(),
//                        version = (int)rdr["version"],
//                        inputParameterSchema = rdr["inputParameterSchema"].ToString(),
//                        billOfMaterialType = (BillOfMaterialType)Enum.Parse(typeof(BillOfMaterialType), rdr["billOfMaterialType"].ToString()),
//                        billOfMaterialProcessingOrder = (int)rdr["billOfMaterialProcessingOrder"],
//                        drivenLayoutSketchId = (int)rdr["drivenLayoutSketchId"],
//                        drivingLayoutSketchId = (int)rdr["drivingLayoutSketchId"],
//                        partName = rdr["partName"].ToString(),

//                    };
//        partCatalog.Add(item);
//                }
//    rdr.Close();
//                //save part catalog to object.  All comaprision will be done with the local copy.
//                //we will build up multiple insert statements and run in batch as a transaction at the end of the process


//            }
//            catch (Exception ex)
//            {
//                Console.WriteLine(ex.ToString());
//            }



//    }
//}
