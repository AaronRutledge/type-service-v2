using LiteDB;

namespace VifabTypeServiceApi.LiteDb
{
    public interface ILiteDbContext
    {
        LiteDatabase Database { get; }
    }
}