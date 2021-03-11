using System;
using System.Collections.Generic;
using System.Text;

namespace TypeServiceLibrary
{
    public class PartNumberItem
    {
        [LiteDB.BsonId]
        public int PartNumber { get; set; }
        public Dictionary<string, string> ConfigurationValuesDictionary { get; set; }
        public int Version { get; set; }
        public int PartTypeId { get; set; }

    }
}
